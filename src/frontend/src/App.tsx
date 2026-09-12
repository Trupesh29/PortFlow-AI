import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { VesselsPage } from './pages/VesselsPage';
import { MapPage } from './pages/MapPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { OperationsPlanPage } from './pages/OperationsPlanPage';
import { CopilotPage } from './pages/CopilotPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="vessels" element={<VesselsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="predictions" element={<PredictionsPage />} />
          <Route path="optimizer" element={<OptimizerPage />} />
          <Route path="operations-plan" element={<OperationsPlanPage />} />
          <Route path="copilot" element={<CopilotPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;