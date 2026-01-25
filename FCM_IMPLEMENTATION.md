# FCM (Firebase Cloud Messaging) Implementation

## Overview
This implementation enables push notifications to be sent to individual models or all models via their stored FCM tokens.

## Architecture

### 1. Data Model
- **Location**: `src/domain/model/types.ts`
- **Field**: `fcmToken?: string` added to `ModelProfile`
- Tokens are stored per model in Firestore `models` collection

### 2. API Endpoints

#### Update FCM Token
- **Endpoint**: `POST /api/model/fcm`
- **Purpose**: Client apps use this to register/update their FCM token
- **Request Body**:
  ```json
  {
    "modelId": "string",
    "fcmToken": "string"
  }
  ```
- **Response**: Standard success/error response

#### Send Notice
- **Endpoint**: `POST /api/notice`
- **Purpose**: Send push notifications to one or all models
- **Request Body**:
  ```json
  {
    "message": "string (required)",
    "title": "string (optional, defaults to 'Notice')",
    "imageUrl": "string (optional)",
    "all": true, // OR
    "modelIds": ["modelId1", "modelId2"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "sent": 5,
    "failed": 0,
    "errors": []
  }
  ```

### 3. Admin UI Integration
- **Location**: `src/app/admin/page.tsx`
- **Features**:
  - Select individual model from dropdown OR toggle "ALL" button
  - Compose notice message (textarea)
  - Optional image URL input
  - Send button triggers API call to `/api/notice`
  - Success feedback shows delivery count

### 4. Firestore Services
- **Location**: `src/domain/model/firestore-services.ts`
- **Updates**:
  - `fetchAllModels()` - includes `fcmToken` in mapping
  - `addModel()` - persists `fcmToken` if provided
  - `updateModel()` - updates `fcmToken` if provided

## Usage Flow

### Client App Registration
1. Client app obtains FCM token from Firebase SDK
2. POST to `/api/model/fcm` with `modelId` and `fcmToken`
3. Token stored in Firestore under model document

### Sending Notices (Admin)
1. Admin selects model(s) or "ALL"
2. Composes message and optionally adds image URL
3. Clicks "Send"
4. API fetches FCM tokens from Firestore
5. Builds multicast message with notification and data payload
6. Sends via Firebase Admin Messaging
7. Returns success/failure counts

## Implementation Details

- **Token Collection**: Tokens are deduplicated before sending
- **Notification Payload**: Includes `title`, `body`, and optional `imageUrl`
- **Platform Support**: Both Android and iOS via platform-specific image fields
- **Error Handling**: Per-token errors returned in response
- **Validation**: Checks for empty token arrays before attempting send

## Environment Requirements
- Firebase Admin SDK credentials configured in `.env`
- Required env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

## Next Steps / Enhancements
- [ ] Add notification history/logging
- [ ] Support scheduled notices
- [ ] Add rich notification templates
- [ ] Include click actions/deep links
- [ ] Add notification preferences per model
