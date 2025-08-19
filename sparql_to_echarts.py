from pathlib import Path
import json
from typing import List, Dict, Any, Optional

def strip_wrappers(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    s = s.strip()
    if s.startswith("<") and s.endswith(">"):
        s = s[1:-1]
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        s = s[1:-1]
    return s

def add_node(nodes: Dict[str, Dict[str, Any]], node_id: str, name: str, category: str, symbol_size: int = 10, extra: Optional[Dict[str, Any]] = None):
    if node_id not in nodes:
        # Create a shorter display name for the label
        display_name = name
        if len(node_id) > 50:  # If ID is very long, truncate it
            short_id = node_id.split('/')[-1][:8]  # Take last part and first 8 chars
            display_name = f"{name} - {short_id}"
        else:
            display_name = f"{name} - {node_id}"
            
        node = {
            "id": node_id,
            "name": display_name,
            "value": name,
            "symbolSize": symbol_size,
            "category": category
        }
        if extra:
            node.update(extra)
        nodes[node_id] = node

def build_echarts_graph(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    nodes: Dict[str, Dict[str, Any]] = {}
    links: List[Dict[str, str]] = []

    for r in rows:
        first_node = strip_wrappers(r.get("firstNode"))
        first_label = strip_wrappers(r.get("firstLabel") or first_node)

        parent_node = strip_wrappers(r.get("parentNode"))
        parent_label = strip_wrappers(r.get("parentLabel") or parent_node)

        branch_pathway = strip_wrappers(r.get("branchPathway"))
        branch_label = strip_wrappers(r.get("branchLabel") or (branch_pathway or ""))

        if first_node:
            add_node(nodes, first_node, first_label or first_node, "node")
        if parent_node:
            add_node(nodes, parent_node, parent_label or parent_node, "node")

        if first_node and parent_node:
            links.append({"source": first_node, "target": parent_node})

        if branch_pathway:
            add_node(nodes, branch_pathway, branch_label or branch_pathway, "step", extra={"node-id": parent_node})
            links.append({"source": parent_node, "target": branch_pathway})

    return {
        "nodes": list(nodes.values()),
        "links": links,
        "categories": [{"name": "step"}, {"name": "node"}]
    }

if __name__ == "__main__":
    # Example usage: read rows from a file and write ECharts JSON
    in_path = Path("new-sparql.json")      # replace with your file
    out_path = Path("echarts_graph.json")

    rows = json.loads(in_path.read_text(encoding="utf-8"))
    graph = build_echarts_graph(rows)
    out_path.write_text(json.dumps(graph, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {out_path}")