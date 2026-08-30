import { createApp } from '@/app';
import { env } from '@/config/environment';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Digital Wardrobe API listening on port ${env.port} [${env.nodeEnv}]`);
});
