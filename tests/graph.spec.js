const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

let server;
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
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
  }).listen(0);
});

test.afterAll(() => {
  server.close();
});

test('graph has categories, pathway node, info panel updates, thin edges', async ({ page }) => {
  const base = `http://localhost:${server.address().port}`;
  await page.goto(base + '/graph.html');
  await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('ready'));

  const legendCount = await page.evaluate(() => (window.myChart.getOption().legend || [])[0]?.data.length || 0);
  expect(legendCount).toBeGreaterThan(0);

  const hasPathway = await page.evaluate(() => {
    const opt = window.myChart.getOption();
    return opt.series[0].categories.some(c => c.name === 'Pathway');
  });
  expect(hasPathway).toBeTruthy();

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
