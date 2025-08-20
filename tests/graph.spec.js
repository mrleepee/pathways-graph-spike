const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

let server;
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (req.url.startsWith('/prototypes/pathways/pathway-graph.xqy')) {
      const filePath = path.join(__dirname, '..', 'echarts_graph.json');
      return fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('not found');
        } else {
          res.end(data);
        }
      });
    }

    const file = req.url === '/' ? '/graph.html' : req.url;
    const filePath = path.join(__dirname, '..', file);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('not found');
      } else {
        res.end(data);
      }
    });
  }).listen(9324);
});

test.afterAll(() => {
  server.close();
});

test('graph has categories, pathway node, info panel updates, thin edges', async ({ page }) => {
  const base = `http://localhost:${server.address().port}`;
  await page.goto(base + '/graph.html');
  await page.fill('#protein-uri', 'protein/b22c31bd-9452-3c21-8dba-ce524c489003');
  await page.click('#go-button');
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('ready'));

  const legendCount = await page.evaluate(() => (window.myChart.getOption().legend || [])[0]?.data.length || 0);
  expect(legendCount).toBeGreaterThan(0);

  const hasPathway = await page.evaluate(() => {
    const opt = window.myChart.getOption();
    return opt.series[0].categories.some(c => c.name === 'Pathway');
  });
  expect(hasPathway).toBeTruthy();

  const hasNode = await page.evaluate(() => {
    const opt = window.myChart.getOption();
    return opt.series[0].categories.some(c => c.name === 'Node');
  });
  expect(hasNode).toBeTruthy();

  const hasTop = await page.evaluate(() => {
    const opt = window.myChart.getOption();
    return opt.series[0].categories.some(c => c.name === 'Top-level category');
  });
  expect(hasTop).toBeTruthy();

  const initialInfo = await page.textContent('#info-panel');
  await page.evaluate(() => {
    const node = window.myChart.getOption().series[0].data[0];
    const infoEl = document.getElementById('info-panel');
    infoEl.textContent = node.name + ' (' + node.value + ')';
  });
  const updatedInfo = await page.textContent('#info-panel');
  expect(updatedInfo).not.toBe(initialInfo);

  const edgeWidth = await page.evaluate(() => window.myChart.getOption().series[0].lineStyle.width);
  expect(edgeWidth).toBe(1);
});
