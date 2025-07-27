# Mixpanel Analytics Integration: Summary Table

| Event Type                | Where to Track?         | SDK                    |
|---------------------------|------------------------|------------------------|
| App launches, navigation  | Frontend (React Native)| mixpanel-react-native  |
| User actions (trips, etc) | Frontend               | mixpanel-react-native  |
| API/server errors         | Backend (Node.js)      | mixpanel               |
| Background jobs           | Backend (Node.js)      | mixpanel               |

## Recommendations
- **Primary:** Track analytics in the frontend using `mixpanel-react-native` for all user interactions, navigation, and feature usage.
- **Secondary (optional):** Track critical backend events using the Node.js SDK if needed (e.g., server errors, background jobs).

## Why?
- **Frontend:** Captures user behavior, navigation, and feature usage directly in the app.
- **Backend:** Captures events not visible to the frontend, such as server-side errors or background processing. 