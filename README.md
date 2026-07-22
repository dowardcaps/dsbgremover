# Rush ID - Background Editor (Next.js frontend)

Upload -> remove background (via the Python API in ../backend) -> drag/zoom
to center the subject on a 1080x1080 canvas with guides -> download PNG.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# edit .env.local -> point NEXT_PUBLIC_BG_REMOVE_API_URL at your backend
npm run dev
```

Open http://localhost:3000

## Deploy

Deploy as usual on Vercel. Set `NEXT_PUBLIC_BG_REMOVE_API_URL` as an
environment variable in the Vercel project settings, pointing at your
deployed Python API (see ../backend/README.md).

## How it matches the manual Photoshop steps

| Photoshop step                          | App equivalent                                  |
|------------------------------------------|--------------------------------------------------|
| New doc, 1080x1080                       | Fixed `OUTPUT_SIZE = 1080` export canvas          |
| 50% guides (vertical + horizontal)       | Cyan crosshair overlay on the crop area           |
| Ctrl+O to open image                     | Drag & drop or "Choose File"                      |
| Select subject, Ctrl+X                   | Python `/remove-bg` call (rembg)                  |
| Center image in doc                      | `react-easy-crop` drag + zoom, square crop area   |
| Export                                   | "Download PNG" button, transparent background     |

## Notes / next steps

- `components/PhotoEditor.tsx` is the whole editor - one file, easy to
  drop into your existing `DS Prints App Tools` hub as another tab/iframe.
- Currently outputs a single 1080x1080 PNG. If a package type needs a
  different canvas size, change `OUTPUT_SIZE` in `PhotoEditor.tsx` or
  make it a prop.
- No image is stored anywhere - everything happens in the browser plus
  one API call to strip the background. Good for privacy, but means a
  page refresh loses progress (fine for a rush-print workflow).
