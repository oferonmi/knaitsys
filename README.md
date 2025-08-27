# Knaitsys - KNowledge-work AI Tool SYStem

![knaitsys_logo](public/knaitsys_thumbnail.png){:style="display:block; margin-left:auto; margin-right:auto"}

<p align="left">
  Knaitsys is focused on reimagining knowledge work tools using LLMs and other AI models.
</p>

## Getting Started
First, Install required packages:
```bash
npm install
# or
pnpm install
# or
yarn install
```
Next, create a ```.env.local``` file containing appropriate enivironment variables/secrets.

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

<!-- This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font. -->

## FFmpeg Requirement

This app requires FFmpeg to be installed and accessible in the system PATH for audio processing.

- On Ubuntu/Debian: `sudo apt-get install -y ffmpeg`
- On macOS: `brew install ffmpeg`
- On Windows: [Download FFmpeg](https://ffmpeg.org/download.html) and add it to your PATH.

If deploying with Docker, FFmpeg is installed in the Dockerfile.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result and use the App.


