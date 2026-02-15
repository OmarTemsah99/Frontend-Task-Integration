## Project Overview

**Project:** Frontend Developer Skills Test - Create Agent Form Integration  

**Stack:** Next.js 16, React 19, TypeScript, shadcn/ui, Tailwind CSS 4, json-server  

**Status:** Static UI → Fully Functional Form Integration  

**Timeline:** 2-3 hours

### Current State

- ✅ UI is fully built with all components in place

- ❌ All form dropdowns are hardcoded (static)

- ❌ File uploads don't persist (client-side only)

- ❌ Save Agent button is non-functional

- ❌ Test Call button is non-functional

---

## Architecture Overview

### API Endpoints (Base: `http://localhost:3001/api`)

#### Reference Data Endpoints

- `GET /api/languages` - Returns language options for dropdown

- `GET /api/voices` - Returns voice options (with tags to display as badges)

- `GET /api/prompts` - Returns prompt templates

- `GET /api/models` - Returns AI model options

#### Agent CRUD

- `POST /api/agents` - Create new agent (returns agent with generated `id`)

- `PUT /api/agents/:id` - Update existing agent

#### File Upload (3-Step Process)

1. `POST /api/attachments/upload-url` - Get signed URL for file upload

2. `PUT {signedUrl}` - Upload binary file to signed URL

3. `POST /api/attachments` - Register attachment in database

#### Test Call

- `POST /api/agents/:id/test-call` - Initiate test call (requires agent to be saved first)

### Component Structure

- Main file: `src/components/agents/agent-form.tsx` (616 lines)

- Props: `mode` ("create" | "edit"), `initialData` (optional)

- Forms sections: Basic Settings, Call Script, Service Description, Reference Data, Tools, Test Call

---

## Required Tasks (4 Primary + Bonus)

### ✅ Task 1: Fetch Dropdown Data from API

**Priority:** HIGH | **Complexity:** MEDIUM | **Time:** ~30 min

#### Requirements

Replace all hardcoded dropdown items with API-fetched data:

| Field | Endpoint | Current | Target |

|-------|----------|---------|--------|

| Language | `/api/languages` | 4 hardcoded items | Dynamic list |

| Voice | `/api/voices` | 6 hardcoded items | Dynamic + badge display |

| Prompt | `/api/prompts` | 4 hardcoded items | Dynamic list |

| Model | `/api/models` | 3 hardcoded items | Dynamic list |

#### Implementation Details

**1.1 Create API client hooks**

- Location: `src/hooks/use-api-data.ts` (NEW)

- Hooks needed:

  - `useLanguages()` - Fetch and cache languages

  - `useVoices()` - Fetch and cache voices

  - `usePrompts()` - Fetch and cache prompts

  - `useModels()` - Fetch and cache models

- Features:

  - Use `useEffect` + `useState` for data fetching

  - Include loading and error states

  - Add try-catch for error handling

  - Optional: Implement caching to prevent repeated requests

**1.2 Update AgentForm dropdown sections**

- Replace hardcoded `<SelectItem>` elements with mapped data from hooks

- For Voice dropdown: Display name + badge tag

- Add loading placeholders/skeletons while fetching

#### Code Example (Voice Dropdown)

```typescript

const { voices, loading, error } = useVoices();



<SelectContent>

  {loading && <SelectItem disabled>Loading voices...</SelectItem>}

  {error && <SelectItem disabled>Error loading voices</SelectItem>}

  {voices?.map((voice) => (

    <SelectItem key={voice.id} value={voice.id}>

      <div className="flex items-center gap-2">

        {voice.name}

        <Badge variant="secondary">{voice.tag}</Badge>

      </div>

    </SelectItem>

  ))}

</SelectContent>

```

---

### ✅ Task 2: Implement File Upload (3-Step Process)

**Priority:** HIGH | **Complexity:** HIGH | **Time:** ~45 min

#### Current State

- Files are stored in `useState<UploadedFile[]>`

- Upload handler only validates file type and stores locally

- No API communication

#### Implementation Details

**2.1 Create file upload utility**

- Location: `src/lib/file-upload.ts` (NEW)

- Functions:

```typescript
async function getUploadUrl(): Promise<{ key: string; signedUrl: string }>;

async function uploadFile(
  signedUrl: string,
  file: File,
): Promise<{ key: string }>;

async function registerAttachment(
  key: string,
  file: File,
): Promise<{ id: string }>;
```

- Handle errors gracefully at each step

**2.2 Update file handling in AgentForm**

- Extend `uploadedFiles` state to track:

  - `name`, `size`, `file` (existing)

  - `id` (attachment ID from API) - NEW

  - `uploadStatus` ("pending" | "uploading" | "uploaded" | "error") - NEW

  - `uploadProgress` (0-100) - NEW

  - `error` (error message if upload fails) - NEW

- Modify `handleFiles()` to trigger upload immediately

- Show upload progress/status for each file

**2.3 Update file UI**

- Replace file list display with upload status indicators:

  - Uploading: Show spinner + progress bar

  - Uploaded: Show checkmark + "Ready"

  - Error: Show error icon + retry button

- Update removeFile() to handle uploaded files (only remove from state)

#### Step-by-Step Flow

```

User selects file(s)

    ↓

handleFiles() called with FileList

    ↓

For each file:

  1. POST /api/attachments/upload-url → Get { key, signedUrl }

  2. PUT {signedUrl} with binary file → Upload

  3. POST /api/attachments → Register with name, size, mimeType

  4. Store returned "id" in uploadedFiles

    ↓

Ready for agent save (include attachment IDs in POST /api/agents)

```

---

### ✅ Task 3: Implement Save Agent

**Priority:** HIGH | **Complexity:** MEDIUM | **Time:** ~40 min

#### Current State

- Save Agent button is not wired to any handler

- No form validation

- Bottom sticky save bar + top header button both exist

#### Implementation Details

**3.1 Add form state tracking**

- Track if agent already has an ID (create vs. edit mode)

- Track if form has unsaved changes

- Add validation for required fields:

  - agentName (required)

  - callType (required)

  - language (required)

  - voice (required)

  - prompt (required)

  - model (required)

**3.2 Create save handler**

- Location: Add function inside AgentForm component

- Logic:

```typescript

  async function handleSaveAgent() {

    // 1. Validate required fields

    if (validation fails) {

      Show error toast

      return

    }

    // 2. Prepare request payload

    const payload = {

      name: agentName,

      description,

      callType,

      language,

      voice,

      prompt,

      model,

      latency: latency[0],

      speed: speed[0],

      callScript,

      serviceDescription,

      attachments: uploadedFiles.map(f => f.id), // IDs from step 2

      tools: {

        allowHangUp: (from switch state - need to add),

        allowCallback: (from switch state - need to add),

        liveTransfer: (from switch state - need to add)

      }

    }

    // 3. Send to API

    const response = mode === "create"

      ? POST /api/agents

      : PUT /api/agents/:id

    // 4. Handle response

    if (success) {

      Store returned agent.id for next saves

      Show success toast

      Update mode to "edit" if creating

    } else {

      Show error toast

    }

  }

```

**3.3 Update Tools switches**

- Add state for each switch:

  - `allowHangUp`

  - `allowCallback`

  - `liveTransfer`

- Connect switches to `useState` (currently not connected)

**3.4 Wire buttons to handler**

- Both "Save Agent"/"Save Changes" buttons (top + bottom)

- Disable during submission (loading state)

- Show loading spinner

---

### ✅ Task 4: Implement Test Call

**Priority:** MEDIUM | **Complexity:** MEDIUM | **Time:** ~30 min

#### Current State

- Test Call button is not wired

- Test Call form fields exist but are isolated

- No validation for required test phone number

#### Implementation Details

**4.1 Create test call handler**

- Location: Add function inside AgentForm component

- Logic:

```typescript

  async function handleStartTestCall() {

    // 1. Validate test phone number is provided

    if (!testPhone) {

      Show error: "Phone number is required"

      return

    }

    // 2. Check if agent has unsaved changes

    if (agentHasUnsavedChanges) {

      Auto-save first using handleSaveAgent()

      if save fails:

        Show error and abort

        return

    }

    // 3. Call test-call endpoint

    const agentId = (from state - stored during save)

    const payload = {

      firstName: testFirstName,

      lastName: testLastName,

      gender: testGender,

      phoneNumber: testPhone

    }

    response = POST /api/agents/:id/test-call

    // 4. Show result to user

    if (success) {

      Show success toast with callId

      Optional: Navigate to call details / show call status

    } else {

      Show error toast

    }

  }

```

**4.2 Update Test Call card**

- Add loading state to button

- Add validation indicator for phone number

- Optional: Show call status after test is initiated

---

## Bonus Tasks (Optional but Recommended)

### 🎯 Bonus 1: Unsaved Changes Alert

**Time:** ~20 min | **Value:** Medium

- Track form changes (dirty flag)

- Show warning dialog when navigating away with unsaved changes

- Use browser `beforeunload` event or Next.js router events

### 🎯 Bonus 2: Loading States & Skeletons

**Time:** ~25 min | **Value:** High

- Add skeleton loaders for dropdowns while fetching

- Show spinners on buttons during API calls

- Add loading state to file upload progress

- Improves perceived performance

### 🎯 Bonus 3: Error Handling & User Feedback

**Time:** ~30 min | **Value:** High

- Implement toast notifications for all operations

- Display inline errors for failed validations

- Show retry buttons for failed uploads/API calls

- Graceful handling of network errors

### 🎯 Bonus 4: Form Validation

**Time:** ~25 min | **Value:** Medium

- Real-time validation for required fields

- Show validation errors inline (below fields)

- Disable Save button if required fields are missing

- Display badge count in section headers (already done for Basic Settings)

### 🎯 Bonus 5: UI/UX Improvements

**Time:** ~30 min | **Value:** Medium

- Add visual feedback for completed steps

- Improve file upload status display

- Better mobile responsiveness

- Add keyboard navigation support

- Smooth transitions/animations

---

## Implementation Checklist

### Phase 1: Setup & Infrastructure (10 min)

- [ ] Create `src/hooks/use-api-data.ts` for API fetching hooks

- [ ] Create `src/lib/file-upload.ts` for file upload utilities

- [ ] Create `src/lib/api-client.ts` for centralized API calls (optional but recommended)

- [ ] Verify environment variables are set (`NEXT_PUBLIC_API_BASE_URL`)

### Phase 2: Task 1 - Dynamic Dropdowns (30 min)

- [ ] Implement `useLanguages()`, `useVoices()`, `usePrompts()`, `useModels()` hooks

- [ ] Update Language dropdown in BasicSettings

- [ ] Update Voice dropdown with badge display

- [ ] Update Prompt dropdown

- [ ] Update Model dropdown

- [ ] Test with mock API running

### Phase 3: Task 2 - File Upload (45 min)

- [ ] Implement file upload utility functions

- [ ] Add upload status tracking to state

- [ ] Integrate upload flow into `handleFiles()`

- [ ] Update file list UI with status indicators

- [ ] Add error handling and retry logic

- [ ] Test with mock API

### Phase 4: Task 3 - Save Agent (40 min)

- [ ] Add missing state: `allowHangUp`, `allowCallback`, `liveTransfer`

- [ ] Connect switches to state

- [ ] Create validation logic

- [ ] Implement `handleSaveAgent()` function

- [ ] Track agent ID after save

- [ ] Wire buttons to handler

- [ ] Add loading states

- [ ] Test create and update flows

### Phase 5: Task 4 - Test Call (30 min)

- [ ] Implement `handleStartTestCall()` function

- [ ] Add validation for required fields

- [ ] Implement auto-save logic

- [ ] Wire button to handler

- [ ] Add loading/success states

- [ ] Test with saved agent

### Phase 6: Bonus Tasks (30-60 min)

- [ ] Implement unsaved changes alert (if time permits)

- [ ] Add loading skeletons for dropdowns

- [ ] Implement toast notifications for all operations

- [ ] Add form validation with inline errors

- [ ] Refine UI/UX improvements

### Phase 7: Testing & Polish (30 min)

- [ ] Test all required functionality end-to-end

- [ ] Test error scenarios (network failures, validation, etc.)

- [ ] Verify TypeScript types are correct

- [ ] Check code style and consistency

- [ ] Test on mobile/tablet views

- [ ] Final review of requirements compliance

---

## Key Technical Considerations

### 1. State Management

- Currently using component-level `useState` (sufficient for this form)

- No need for global state management (prop drilling is manageable)

- Consider using `useReducer` if state becomes too complex

### 2. API Base URL

- Should be set via `NEXT_PUBLIC_API_BASE_URL` environment variable

- Default: `http://localhost:3001/api`

- Set in `.env.local` (copy from `.env.example`)

### 3. File Upload Edge Cases

- Handle multiple file selections

- Handle failed uploads gracefully (allow retry)

- Prevent duplicate uploads

- Show clear error messages

- Consider file size limits

### 4. Type Safety

- Create TypeScript interfaces for API responses:

  - `Language`, `Voice`, `Prompt`, `Model`

  - `Agent`, `Attachment`

  - `TestCall` request/response

- Ensure all API calls are properly typed

### 5. Error Handling Strategy

- Try-catch blocks for all async operations

- User-friendly error messages (not technical)

- Show error toasts/notifications

- Optional: Implement error logging/monitoring

- Retry logic for transient failures

### 6. Loading States

- Disable buttons during submissions

- Show spinners/loaders during fetches

- Optional: Add skeleton loaders for dropdowns

- Provide clear feedback to users

---

## Code Organization Recommendation

```

src/

├── components/

│   └── agents/

│       └── agent-form.tsx (existing - will be modified)

├── hooks/

│   ├── use-mobile.ts (existing)

│   └── use-api-data.ts (NEW)

├── lib/

│   ├── utils.ts (existing)

│   ├── api-client.ts (NEW - centralized API calls)

│   └── file-upload.ts (NEW - file upload utilities)

└── types/

    └── api.ts (NEW - TypeScript interfaces for API types)

```

---

## Testing Strategy

### Manual Testing Checklist

#### Task 1 - Dropdowns

- [ ] Load page and verify dropdowns show loading state

- [ ] Verify data loads from API

- [ ] Verify Voice dropdown shows badges

- [ ] Verify dropdown values persist when selected

- [ ] Test with API server down (error handling)

#### Task 2 - File Upload

- [ ] Upload single file via click

- [ ] Upload multiple files via drag-drop

- [ ] Verify files are uploaded to API

- [ ] Verify attachment IDs are stored

- [ ] Verify upload progress is shown

- [ ] Test upload with network error (retry)

- [ ] Test with unsupported file type (validation)

- [ ] Remove file before/after upload

#### Task 3 - Save Agent

- [ ] Create new agent with all required fields

- [ ] Verify agent is saved to API

- [ ] Verify agent ID is returned and stored

- [ ] Update agent and verify PUT request is sent

- [ ] Test saving with missing required fields (validation)

- [ ] Test with network error (error handling)

#### Task 4 - Test Call

- [ ] Save agent first

- [ ] Initiate test call from saved agent

- [ ] Verify test call payload is correct

- [ ] Verify test call response shows success

- [ ] Test with unsaved agent (auto-save first)

- [ ] Test with missing phone number (validation)

---

## Time Management

**Total Estimated Time:** 2.5-3 hours

| Phase | Time | Status |

|-------|------|--------|

| Setup | 10 min | ⏳ |

| Task 1 (Dropdowns) | 30 min | ⏳ |

| Task 2 (File Upload) | 45 min | ⏳ |

| Task 3 (Save Agent) | 40 min | ⏳ |

| Task 4 (Test Call) | 30 min | ⏳ |

| Testing & Polish | 30 min | ⏳ |

| **Subtotal (Required)** | **2h 25m** | |

| Bonus Tasks | 30-60 min | Optional |

| **Total** | **2h 55m - 3h 25m** | |

---

## Success Criteria

✅ **Task 1 Complete:** All dropdowns show API data dynamically  

✅ **Task 2 Complete:** Files upload successfully through 3-step process  

✅ **Task 3 Complete:** Agent saves and creates/updates correctly  

✅ **Task 4 Complete:** Test calls work after agent is saved  

✅ **Bonus Complete:** Unsaved changes alert + loading states + error handling  

All code is:

- TypeScript-compliant with proper types

- Following existing code style and patterns

- Well-organized and maintainable

- Properly error-handled

- Responsive and mobile-friendly

---

## Troubleshooting Guide

### Problem: API calls return 404

**Solution:** Verify `json-server` is running on port 3001 and routes are configured in `server/routes.json`

### Problem: File upload fails

**Solution:** Check CORS settings and verify signed URL generation is working

### Problem: Dropdown data won't load

**Solution:** Verify `.env.local` has `NEXT_PUBLIC_API_BASE_URL` set correctly

### Problem: Agent not saving

**Solution:** Validate all required fields are filled and API endpoint is responding

### Problem: TypeScript errors

**Solution:** Ensure all types are defined and checked before runtime

---

## Next Steps

1. **Start:** Review this plan and verify understanding

2. **Setup:** Configure environment and create file structure

3. **Execute:** Follow phases sequentially

4. **Test:** Test each feature as you complete it

5. **Review:** Compare against requirements before considering complete

6. **Bonus:** If time remains, implement bonus features

7. **Polish:** Final code review and cleanup

Good luck! 🚀
