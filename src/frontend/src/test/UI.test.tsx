import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { OperationsPlanPage } from '../pages/OperationsPlanPage';
import { CopilotPage } from '../pages/CopilotPage';

describe('Theme and Layout', () => {
  it('Theme renders light background on AppLayout', () => {
    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    const layoutDiv = screen.getByRole('main').parentElement?.parentElement;
    expect(layoutDiv).toHaveClass('bg-port-warmWhite');
  });

  it('Mobile layout provides a menu toggle', () => {
    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    // Menu button is present for mobile
    const toggle = screen.getByLabelText('Toggle menu');
    expect(toggle).toBeInTheDocument();
  });
});

describe('Operations Plan Actions', () => {
  it('Approve dialog opens and confirms action', async () => {
    render(<OperationsPlanPage />);
    
    // Check initial state
    expect(screen.getByText(/Proposed Plan/i)).toBeInTheDocument();
    
    // Click approve button
    const approveBtn = screen.getByRole('button', { name: /Approve Plan/i });
    fireEvent.click(approveBtn);
    
    // Dialog opens
    const dialogHeader = screen.getByText('Approve Operations Plan?');
    expect(dialogHeader).toBeInTheDocument();
    
    // Confirm approval
    const confirmBtn = screen.getByRole('button', { name: /Confirm Approval/i });
    fireEvent.click(confirmBtn);
    
    // State updates to active plan
    expect(screen.getByText(/Active Demo Plan/i)).toBeInTheDocument();
  });

  it('Reject dialog opens and confirms action', async () => {
    render(<OperationsPlanPage />);
    
    // Check initial state
    expect(screen.getByText(/Proposed Plan/i)).toBeInTheDocument();
    
    // Click reject button
    const rejectBtn = screen.getByRole('button', { name: /Reject Plan/i });
    fireEvent.click(rejectBtn);
    
    // Dialog opens
    const dialogHeader = screen.getByText('Reject Operations Plan?');
    expect(dialogHeader).toBeInTheDocument();
    
    // Confirm rejection
    const confirmBtn = screen.getByRole('button', { name: /Confirm Rejection/i });
    fireEvent.click(confirmBtn);
    
    // State updates to rejected plan
    expect(screen.getByText(/Rejected Plan/i)).toBeInTheDocument();
  });
});

describe('Copilot Interactions', () => {
  it('Allows asking a question and displays assistant response', async () => {
    vi.useFakeTimers();
    render(<CopilotPage />);
    
    // Find a suggested question
    const suggestedBtn = screen.getByText('Why is congestion high tomorrow?');
    fireEvent.click(suggestedBtn);
    
    // The user's question should be rendered
    expect(screen.getByText('Why is congestion high tomorrow?')).toBeInTheDocument();
    
    // Fast-forward the timeout
    act(() => {
      vi.runAllTimers();
    });
    
    // The assistant's structured response should be rendered synchronously now
    const answerHeading = screen.getByText('Situation');
    expect(answerHeading).toBeInTheDocument();
    
    vi.useRealTimers();
  });
});
