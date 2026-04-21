import { BookingForm } from "./components/BookingForm";
import { IframeHeightReporter } from "./components/IframeHeightReporter";

export default function App() {
  return (
    <div className="min-h-screen bg-ocean-50 pb-24">
      <IframeHeightReporter />
      <BookingForm />
    </div>
  );
}
