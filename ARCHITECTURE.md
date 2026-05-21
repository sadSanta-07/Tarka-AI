watch() subscription for localStorage instead of useEffect with watchedTools as dependency. This is the correct pattern — watch() returns a subscription you can unsubscribe from, so no memory leaks and no stale closure issues.

handleToolChange resets planId to "" when tool changes. Without this, someone could switch from Cursor to Claude while still having planId: "pro" — which exists on both but means different things. Prevents silent wrong data.

z.coerce.number() on seats and monthlySpend. HTML inputs always return strings — coerce converts "20" to 20 before validation. Without this, your zod schema would reject valid inputs.