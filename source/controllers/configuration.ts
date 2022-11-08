/** source/controllers/configuration.ts */
import { Request, Response, NextFunction } from "express";
import { NginxConfFile } from "nginx-conf";
const filename = `${__dirname}/../files/readme.conf`;
const { exec } = require("child_process");

const getConfigurations = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  NginxConfFile.create(filename, function (err, conf) {
    return res.status(200).json({
      message: conf ? conf.nginx.server?.[0] : [],
    });
  });
};

// adding a configuration
const addConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  // get the data from req.body
  let port: string = req.body.port;
  let name: string = req.body.name;

  NginxConfFile.create(filename, function (err, conf) {
    if (err || !conf) {
      console.log(err);
      return res.status(500).json({
        message: "Internal Server Error!",});
    }

    const onFlushed = () => {
      console.log("finished writing to disk");
    };

    const lastIndex = conf ? conf.nginx.server?.[0].location?.length : 0;
    // blocks with values:
    conf.nginx.server?.[0]._add("location", `/${name}`);
    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_redirect",
        "off"
    );
    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_pass",
        `http://127.0.0.1:${port}`
    );
    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_http_version",
        "1.1"
    );
    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_set_header",
        "Upgrade $http_upgrade"
    );

    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_set_header",
        'Connection "upgrade"'
    );
    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_set_header",
        "Host $http_host"
    );
    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_set_header",
        "X-Real-IP $remote_addr"
    );
    conf.nginx.server?.[0].location?.[lastIndex as number]._add(
        "proxy_set_header",
        "X-Forwarded-For $proxy_add_x_forwarded_for"
    );

    conf.flush();
    exec("systemctl restart nginx ", (error: { message: any; }, stdout: any, stderr: any) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return res.status(500).json({
          message: "Internal Server Error!",
        });
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    return res.status(200).json({
      message: {
        port,
        name,
      },
    });
  });
};

export default { getConfigurations, addConfiguration };