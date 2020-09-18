import express from 'express';
import controller from '../controllers/ocorrenciaController.js';

const app = express();

app.post('/ocorrencias/', controller.upload);
app.get('/ocorrencias/', controller.findAll);
// app.get('/ocorrencias/:id', controller.findOne);
// app.put('/ocorrencias/:id', controller.update);
// app.delete('/ocorrencias/:id', controller.remove);
// app.delete('/ocorrencias/', controller.removeAll);

export { app as ocorrenciaRouter };
