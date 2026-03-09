import { router } from "./routes";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
