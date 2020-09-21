// import { logger } from '../config/logger.js';
import formidable from 'formidable';
import * as fs from 'fs';

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
          // console.log('Got file:', file.name);
          if (numberOfFiles >= 1) {
            reject('This method only allows the upload of a single file.');
          }
          oldPath = file.path;
          fileName = file.name;
          numberOfFiles++;
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

    if (numberOfFiles !== 1) throw new Error('Missing file in the request.');

    const destinationFolder =
      process.cwd() + `\\ocorrencias\\${periodo}\\${regional}\\${id}\\`;

    // create the directory it it doesn't exist
    try {
      fs.mkdirSync(destinationFolder, { recursive: true });
    } catch (err) {
      res.status(404).send(err);
    }

    newPath = destinationFolder + fileName;

    //check if file exists
    try {
      fs.accessSync(newPath);
      // file with same name exists

      // insert (1) in the end if file already exist
      let fileNameDivided = fileName.split('.');
      let index = 1;
      while (true) {
        let fileNameJoin = fileNameDivided[0];
        for (let i = 1; i < fileNameDivided.length; i++) {
          if (i === fileNameDivided.length - 1) {
            fileNameJoin += `(${index}).${fileNameDivided[i]}`;
          } else {
            fileNameJoin += '.' + fileNameDivided[i];
          }
        }

        newPath = destinationFolder + fileNameJoin;

        fs.accessSync(newPath);
        index++;
      }
    } catch (err) {
      // file with same name doesn't exist
    }

    try {
      fs.renameSync(oldPath, newPath);
    } catch (err) {
      res.status(404).send(err);
    }

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
      fs.readFileSync(currentFolder + '//ocorrencias//ocorrencias.json')
    );

    res.send(ocorrencias);
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message || 'Erro ao obter todas as ocorrencias' });
  }
};

export default { upload, findAll };
