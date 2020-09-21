// import { logger } from '../config/logger.js';
import { promises as fs } from 'fs';
import formidable from 'formidable';

const upload = async (req, res) => {
  let regional = '',
    periodo = '',
    id = '';

  let oldPath = '',
    newPath = '',
    fileName = '';

  let numberOfFiles = 0;

  const form = new formidable.IncomingForm();

  try {
    await new Promise((resolve, reject) => {
      form
        .parse(req)
        .on('file', function (_, file) {
          console.log('Got file:', file.name);
          oldPath = file.path;
          fileName = file.name;
          numberOfFiles++;
        })
        .on('field', function (name, field) {
          console.log('Got a field:', name);
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
              reject(`Unexpected field: ${name}.`);
          }
        })
        .on('err', function (err) {
          reject(err);
        })
        .on('end', async function () {
          resolve();
        });
    }).catch((err) => {
      throw new Error(err);
    });

    if (!regional || !periodo || !id)
      throw new Error(
        'Missing one of the following mandatory fields: regional, periodo and/or id'
      );

    if (numberOfFiles !== 1) throw new Error('Number of files must be one.');

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

    res.send({ Success: 'File uploaded and moved!' });
  } catch (err) {
    res
      .status(500)
      .send({ Error: err.message || 'Error while uploading file.' });
  }
};

const findAll = async (_, res) => {
  const currentFolder = process.cwd();
  try {
    const ocorrencias = JSON.parse(
      await fs.readFile(currentFolder + '//ocorrencias//ocorrencias.json')
    );

    res.send(ocorrencias);
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message || 'Erro ao obter todas as ocorrencias' });
  }
};

export default { upload, findAll };
