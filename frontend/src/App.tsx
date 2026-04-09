// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuotationWizard from '../src/pages/QuotationWizard';
import QuotationList from '../src/components/QuotationList'; // Asegúrate de crear este componente
import QuotationDetail from '../src/components/QuotationDetail';
import GenerateQuotePage from '../src/components//quote/GenerateQuotePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuotationWizard />} />
        <Route path="/quotations" element={<QuotationList />} />
        <Route path="/new-quotation" element={<QuotationWizard />} />
        <Route path="/quotations/:id" element={<QuotationDetail />} />
        <Route path="/quotations/:id/quote" element={<GenerateQuotePage />} />
        {/* Añade más rutas según necesites */}
      </Routes>
    </Router>
  );
}

export default App;