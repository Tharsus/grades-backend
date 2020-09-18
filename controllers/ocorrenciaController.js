// import { logger } from '../config/logger.js';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import { parse } from 'querystring';

const upload = async (req, res) => {
  let regional = '',
    periodo = '',
    id = '';

  let oldPath = '',
    newPath = '',
    fileName = '';

  try {
    new formidable.IncomingForm()
      .parse(req)
      .on('file', function (_, file) {
        // console.log('Got file:', file.name);
        oldPath = file.path;
        fileName = file.name;
      })
      .on('field', function (name, field) {
        // console.log('Got a field:', name);
        switch (name) {
          case 'regional':
            regional = field;
            break;
          case 'periodo':
            periodo = field;
            break;
          case 'id':
            id = field;
            break;

          default:
            res.status(404).send(`Unexpected field ${name}.`);
        }
      })
      .on('error', function (err) {
        throw new Error(err);
      })
      .on('end', async function () {
        // console.log('regional: ' + regional);
        // console.log('periodo: ' + periodo);
        // console.log('id: ' + id);
        // console.log(oldPath);

        const destinationFolder =
          process.cwd() + `\\ocorrencias\\${periodo}\\${regional}\\${id}\\`;
        // console.log(destinationFolder);

        try {
          await fs.mkdir(destinationFolder, { recursive: true });
        } catch (err) {
          res.status(404).send(err);
        }

        newPath = destinationFolder + fileName;
        console.log(newPath);

        await fs.rename(oldPath, newPath, function (err) {
          if (err) throw err;
        });

        res.send('File uploaded and moved!');
      });
  } catch (err) {
    res
      .status(500)
      .send({ message: error.message || 'Erro ao enviar arquivo' });
  }
};

const findAll = async (req, res) => {
  try {
    res.send();
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message || 'Erro ao obter todas as ocorrencias' });
  }
};

export default { upload, findAll };
