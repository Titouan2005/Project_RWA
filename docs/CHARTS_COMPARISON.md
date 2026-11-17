# Recharts vs Chart.js

The `/admin` page shows the same data, the total stock of each brand, with two different libraries:

- a **bar chart** made with **Recharts** (`components/StockBarChart.tsx`)
- a **line chart** made with **Chart.js** through react-chartjs-2 (`components/StockLineChart.tsx`)

The data comes from one call to PocketBase (`listProducts()`), summed per brand by `stockByBrand()` in `lib/stats.ts`, and passed to both charts as `[{ brand, stock }, ...]`.

## Bar chart vs line chart

A bar chart compares separate categories: each bar is one brand, and its height is the stock. It is the natural choice here, because Dell, Lenovo and Acer are independent categories.

A line chart joins the points in order. It is best for showing a trend along an ordered axis, such as time. With brands on the x axis, the line only links the values; the points carry the information, not the slope between them.

## How each one is implemented

### Recharts: React components

```tsx
<ResponsiveContainer>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="brand" />
    <YAxis allowDecimals={false} />
    <Tooltip />
    <Bar dataKey="stock" fill="#2563eb" />
  </BarChart>
</ResponsiveContainer>
```

The chart is described with JSX components, like the rest of the app. The data array is passed as it is, and `dataKey` tells each part which field to read.

### Chart.js: a configuration object

```tsx
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

<Line
  data={{
    labels: data.map((d) => d.brand),
    datasets: [{ label: "Stock", data: data.map((d) => d.stock), borderColor: "#dc2626" }],
  }}
  options={{ responsive: true, scales: { y: { beginAtZero: true } } }}
/>
```

The chart is described with one object (`data` and `options`). The data must be split into two parallel arrays: `labels` and the `data` of each dataset. The parts of Chart.js that are used must be registered first with `ChartJS.register`, which lets the bundler leave out the unused parts.

## Main differences

| | Recharts | Chart.js |
|---|---|---|
| Rendering | SVG: each bar is an element in the page | Canvas: the chart is drawn as pixels |
| How it is written | React components (declarative JSX) | Configuration object (`data` + `options`) |
| Data format | Array of objects + `dataKey` | `labels` array + one array per dataset |
| Setup | Nothing to register | Elements must be registered with `ChartJS.register` |
| Responsive | `ResponsiveContainer` around the chart | `responsive: true` option |
| Customising | Swap or add components | Change options |
| Large datasets | Slower: one SVG element per point | Faster: drawing on a canvas stays light |
| Testing | SVG elements can be found in the page | Canvas content cannot be read; the e2e test only checks that the canvas exists |

## Conclusion

Recharts was the simpler of the two in this project: the chart is written in JSX like the rest of the app, the data is used as it is, and the bars can be found in the page by the tests. Chart.js needs a little more setup (registering elements, reshaping the data into arrays), but it draws on a canvas, which keeps it fast when there are many points.

For a small dashboard like this one, I would choose Recharts. For a chart with thousands of points, I would choose Chart.js.
