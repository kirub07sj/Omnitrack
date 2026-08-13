import app from './app';
import { syncEngine } from './modules/sync/sync.engine';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start the background synchronization engine (checks every 60 seconds)
  syncEngine.start(60000);
});
