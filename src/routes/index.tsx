import { createFileRoute } from '@tanstack/react-router'

const Index = () => (
  <div className="flex flex-col h-screen justify-center items-center">
    <div className=" p-4 border-2 border-blue-600 rounded-lg">
      <h1 className="text-xl font-bold my-2">Welcome!</h1>
      <p className="text-lg">This is a small collection of React examples.</p>
      <p className="text-lg">Use the navigation bar at the top to visit each one.</p>
    </div>
  </div>
);

export const Route = createFileRoute('/')({
  component: Index,
});