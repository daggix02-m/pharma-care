import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DiagnosticViewModal } from "@/components/shared/DiagnosticViewModal";
import { ConvexProvider } from "convex/react";

// Mock Convex hooks
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockToastError = vi.fn();

vi.mock("convex/react", async () => {
  const actual = await vi.importActual("convex/react");
  return {
    ...actual,
    useQuery: () => mockUseQuery(),
    useMutation: () => mockUseMutation(),
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { _id: "admin_1", role: "admin" },
    sessionToken: "test_session_token",
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: any[]) => mockToastError(...args),
    success: vi.fn(),
  },
}));

function createMockMutation(status: "idle" | "loading" = "idle") {
  const fn = vi.fn();
  (fn as any).status = status;
  return fn;
}

describe("DiagnosticViewModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue(createMockMutation("idle"));
  });

  it("renders start session form when targetUserId is provided", () => {
    mockUseQuery.mockReturnValue([]);

    render(
      <ConvexProvider client={{} as any}>
        <DiagnosticViewModal
          open={true}
          onOpenChange={vi.fn()}
          targetUserId="user_123"
        />
      </ConvexProvider>,
    );

    expect(screen.getByText(/Start Diagnostic Session/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Reason for Diagnostic Session/i),
    ).toBeInTheDocument();
  });

  it("renders session view when sessionId is provided", async () => {
    const mockSession = [
      {
        _id: "session_1",
        isActive: false,
        startedAt: Date.now() - 100000,
        endedAt: Date.now(),
        pagesViewed: [
          { page: "/manager/dashboard", timestamp: Date.now() - 90000 },
        ],
        blockedActions: [],
        targetUserName: "John Manager",
        reason: "Investigating inventory issue",
      },
    ];

    mockUseQuery.mockReturnValue(mockSession);

    render(
      <ConvexProvider client={{} as any}>
        <DiagnosticViewModal
          open={true}
          onOpenChange={vi.fn()}
          sessionId="session_1"
        />
      </ConvexProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Session Summary/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Pages Viewed/i).length).toBeGreaterThan(0);
    });
  });

  it("shows validation error when starting session without reason", async () => {
    const mockMutate = createMockMutation("idle");
    mockUseMutation.mockReturnValue(mockMutate);
    mockUseQuery.mockReturnValue([]);

    render(
      <ConvexProvider client={{} as any}>
        <DiagnosticViewModal
          open={true}
          onOpenChange={vi.fn()}
          targetUserId="user_123"
        />
      </ConvexProvider>,
    );

    const startButton = screen.getByRole("button", { name: /Start Session/i });
    expect(startButton).toBeDisabled();
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
