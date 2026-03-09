import { router } from "./routes";
import { AuthProvider } from "@/providers/AuthProvider";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
