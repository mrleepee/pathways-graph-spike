# Pathways Graph Visualization - Spike Version

A web-based visualization tool for displaying biological pathway relationships using ECharts and SPARQL data processing. This is the spike/prototype version for experimentation and rapid development.

## 🚀 Features

- **Interactive Graph Visualization**: Beautiful, interactive network graphs using ECharts
- **SPARQL Data Processing**: Python script to convert SPARQL results to ECharts-compatible JSON
- **Real-time Updates**: Live graph updates as you modify the data
- **Responsive Design**: Works on desktop and mobile devices
- **Customizable Layouts**: Force-directed and fixed positioning options

## 📁 Project Structure

```
pathways-graph/
├── sparql_to_echarts.py    # Python script to process SPARQL data
├── graph.html              # Main visualization interface
├── echarts_graph.json      # Generated graph data (from SPARQL)
├── new-sparql.json         # Sample SPARQL result data
├── echarts.min.js          # ECharts library
└── README.md               # This file
```

## 🛠️ Setup & Usage

### 1. Prerequisites
- Python 3.7+
- Modern web browser
- HTTP server (for local development)

### 2. Data Processing
```bash
# Process SPARQL results to ECharts format
python3 sparql_to_echarts.py
```

### 3. View the Visualization
```bash
# Start local HTTP server
python3 -m http.server 9111

# Open in browser: http://localhost:9111/graph.html
```

## 📊 Data Format

### Input (SPARQL Results)
The script expects JSON with the following structure:
```json
[
  {
    "firstNode": "<node-uri>",
    "firstLabel": "\"Node Name\"",
    "parentNode": "<parent-uri>",
    "parentLabel": "\"Parent Name\"",
    "branchPathway": "<pathway-uri>",
    "branchLabel": "\"Pathway Name\""
  }
]
```

### Output (ECharts Graph)
```json
{
  "nodes": [
    {
      "id": "node-uri",
      "name": "Node Name - ID",
      "category": "node|step"
    }
  ],
  "links": [
    {
      "source": "source-node-id",
      "target": "target-node-id"
    }
  ],
  "categories": [
    {"name": "node"},
    {"name": "step"}
  ]
}
```

## 🔧 Customization

### Node Categories
- **node**: Main pathway nodes
- **step**: Pathway step nodes with additional metadata

### Label Format
Nodes display as "Name - ID" where:
- Long IDs are truncated for readability
- Short IDs show the full identifier

### Graph Layout
- **Force-directed**: Automatic layout for graphs without coordinates
- **Fixed**: Use predefined x,y coordinates if available

## 🌐 Live Demo

Visit the visualization at: [http://localhost:9111/graph.html](http://localhost:9111/graph.html)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the maintainers.
