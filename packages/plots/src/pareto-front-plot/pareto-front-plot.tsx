import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from 'recharts'

const CustomTooltip = ({ payload, label }: any) => {
  console.log('payload', payload, label)
  // if (active && payload && payload.length) {
  //   return (
  //     <div style={{ background: 'white', padding: '2px' }}>
  //       <b>
  //         {payload[0].value}, {payload[1].value}
  //       </b>
  //       <br />
  //       {payload[0].payload.inputs !== undefined
  //         ? payload[0].payload.inputs.map(p => (
  //             <>
  //               {p.name}: {p.value}
  //               <br />
  //             </>
  //           ))
  //         : ''}
  //     </div>
  //   )
  // }
  return null
}

export default function ParetoFrontPlot() {
  const dataScore = [
    {
      x: 0.1,
      y: 0.2,
      inputs: [
        { name: 'inputA', value: 1 },
        { name: 'inputB', value: 2 },
      ],
    },
    {
      x: 0.12,
      y: 0.1,
      inputs: [
        { name: 'inputA', value: 1 },
        { name: 'inputB', value: 2 },
      ],
    },
    {
      x: 0.17,
      y: 0.3,
      inputs: [
        { name: 'inputA', value: 1 },
        { name: 'inputB', value: 2 },
      ],
    },
    {
      x: 0.14,
      y: 0.25,
      inputs: [
        { name: 'inputA', value: 1 },
        { name: 'inputB', value: 2 },
      ],
    },
    {
      x: 0.15,
      y: 0.4,
      inputs: [
        { name: 'inputA', value: 1 },
        { name: 'inputB', value: 2 },
      ],
    },
    {
      x: 0.11,
      y: 0.28,
      inputs: [
        { name: 'inputA', value: 1 },
        { name: 'inputB', value: 2 },
      ],
    },
  ]

  const dataPareto = [
    { x: 0.11, y: 0.25 },
    { x: 0.12, y: 0.26 },
    { x: 0.13, y: 0.27 },
    { x: 0.14, y: 0.28 },
    { x: 0.15, y: 0.29 },
    { x: 0.16, y: 0.3 },
  ]

  return (
    <div style={{ height: '600px', width: '600px' }}>
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
          <Tooltip
            isAnimationActive={false}
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter
            name="Observations"
            data={dataScore}
            fill="blue"
            shape="circle"
            legendType="circle"
          />
          <Scatter
            name="Estimated pareto front"
            data={dataPareto}
            fill="red"
            shape="diamond"
            legendType="diamond"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
