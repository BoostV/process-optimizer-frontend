import useSwr from "swr";
import { useState } from "react";
import { Button } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import { useForm } from "react-hook-form";

const fetcher = async (url: string) => (await fetch(url)).json();
interface Inputs {
  name: string;
}

export default function ExperimentLoader() {
  const { data, error } = useSwr("/api/experiment", fetcher);
  const [experiment, setExperiment] = useState({ id: "" });
  const [experimentId, setExperimentId] = useState<string>();
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit = async (data: Inputs) => {
    setExperimentId(data.name);
    fetchData(data.name)
  };

  const fetchData = async (id) => {
    const req = await fetch(`/api/experiment/${id}`);
    const newData = await req.json();

    console.log(newData);
    return setExperiment(newData);
  };

  const createNewExperiment = async () => {
    const req = await fetch("/api/experiment", { method: "POST" });
    const newData = await req.json();

    console.log(newData);
    return setExperiment(newData);
  };

  if (error) return <div>Failed to load users</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <Button variant="contained" color="primary" onClick={createNewExperiment}>
        Create new experiment
      </Button>
      <br />
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            inputRef={register}
            id="name"
            name="name"
            helperText="Enter your name and press [Enter]"
          />
        </form>
        {experimentId && <div>Submitted: {experimentId}</div>}
      </>
      {JSON.stringify(experiment)}
    </div>
  );
}
