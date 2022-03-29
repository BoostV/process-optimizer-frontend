import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';

const CustomTooltip = ({ active, payload, label, cheese }: any) => {
  console.log('payload', payload, label)
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', padding: '2px' }} >
        <b>{payload[0].value}, {payload[1].value}</b>
        <br />
        {payload[0].payload.inputs !== undefined ? payload[0].payload.inputs.map(p => 
          <>
            {p.name}: {p.value}
            <br/>
          </>
        ) : ''}
      </div>
    )
  }
  return null
}

export default function ParetoFrontPlot() {
  const dataScore = [
    { x: 0.100, y: 0.200, inputs: [{ name: 'inputA', value: 1 }, { name: 'inputB', value: 2 }] },
    { x: 0.120, y: 0.100, inputs: [{ name: 'inputA', value: 1 }, { name: 'inputB', value: 2 }] },
    { x: 0.170, y: 0.300, inputs: [{ name: 'inputA', value: 1 }, { name: 'inputB', value: 2 }] },
    { x: 0.140, y: 0.250, inputs: [{ name: 'inputA', value: 1 }, { name: 'inputB', value: 2 }] },
    { x: 0.150, y: 0.400, inputs: [{ name: 'inputA', value: 1 }, { name: 'inputB', value: 2 }] },
    { x: 0.110, y: 0.280, inputs: [{ name: 'inputA', value: 1 }, { name: 'inputB', value: 2 }] },
  ]

  const dataPareto = [
    { x: 0.110, y: 0.250 },
    { x: 0.120, y: 0.260 },
    { x: 0.130, y: 0.270 },
    { x: 0.140, y: 0.280 },
    { x: 0.150, y: 0.290 },
    { x: 0.160, y: 0.300 },
  ]

  return (
    <div style={{ height:"600px", width:"600px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <Legend wrapperStyle={{ position: 'relative' }} />
          <CartesianGrid />
          <XAxis tickCount={10} type="number" dataKey="x" name="score1">
            <Label value="score1" position="bottom" />
          </XAxis>
          <YAxis tickCount={10} type="number" dataKey="y" name="score2">
            <Label value="score2" position="insideLeft" angle={-90} />
          </YAxis>
          <Tooltip isAnimationActive={false} content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Observations" data={dataScore} fill="blue" shape="circle" legendType="circle" />
          <Scatter name="Estimated pareto front" data={dataPareto} fill="red" shape="diamond" legendType="diamond" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}