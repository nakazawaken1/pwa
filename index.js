(async () => {
  const express = require('express');
  const webPush = require('web-push');
  const { writeFile, readFile } = require('fs/promises');

  const keys = await readFile('keys.json').then(JSON.parse).catch(e => {
    const k = webPush.generateVAPIDKeys();
    writeFile('keys.json', JSON.stringify(k));
    return k;
  })
  console.log(keys);

  webPush.setVapidDetails(
    'mailto:nakazawaken1@gmail.com',
    keys.publicKey,
    keys.privateKey
  );

  const app = express();
  app.use(express.json());
  app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
  app.get('/sw.js', (req, res) => res.sendFile(__dirname + '/sw.js'));
  app.get('/manifest.json', (req, res) => res.sendFile(__dirname + '/manifest.json'));
  app.get('/key', (req, res) => res.send(keys.publicKey));
  app.post('/subscribe', async (req, res) => {
    const subscription = req.body;
    console.log(subscription);
    const subscriptions = await readFile('subscriptions.json').then(JSON.parse).catch(e => []);
    if (!subscriptions.some(s => s.endpoint === subscription.endpoint)) {
      subscriptions.push(subscription);
      await writeFile('subscriptions.json', JSON.stringify(subscriptions));
    }
    res.sendStatus(200);
  });
  app.post('/notify', async (req, res) => {
    const payload = JSON.stringify({ title: '通知', body: 'こんにちは！' });
    const subscriptions = JSON.parse(await readFile('subscriptions.json') || '[]');
    console.log(subscriptions);
    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, payload);
      } catch (e) {
        console.error('通知送信エラー:' + subscription.endpoint, e);
      }
    }
    res.sendStatus(200);
  });

  const port = process.env.PORT || 3003;
  app.listen(port, () => console.log(`http://localhost:${port}`));
})();