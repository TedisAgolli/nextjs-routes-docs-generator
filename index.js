#!/usr/bin/env node
const path = require("path");
const { readdir } = require("fs").promises;
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { Parser } = require("acorn");
const recast = require("recast");
const yaml = require("js-yaml");
const { program, Argument } = require("commander");
const chalk = require("chalk");

function generateRoutes(dir, options) {
  const content = [];
  const spec = {
    swagger: "2.0",
    info: {
      title: "Swagger API",
      version: "1.0.0",
    },
    paths: {},
  };

  const { text, swagger } = options;
  const outputBoth = !text && !swagger;
  const apiDir = path.join(dir, "pages", "api");

  getFiles(apiDir)
    .then((files) => {
      files.forEach((file) => {
        const path = file.split("\\pages\\")[1].split(".")[0];
        if (text || outputBoth) {
          content.push(file);
        }
        if (swagger || outputBoth) {
          spec.paths[path] = {};
        }

        const ast = Parser.parse(readFileSync(file).toString(), {
          ecmaVersion: "latest",
          sourceType: "module",
        });
        let reqName;
        recast.visit(ast, {
          visitExportDefaultDeclaration: function (mainFunction) {
            reqName = mainFunction.value.declaration.params[0].name;
            recast.visit(mainFunction, {
              visitIfStatement: function (ifStmtPath) {
                // console.log(path.value.type);
                if (ifStmtPath.value.test.type === "BinaryExpression") {
                  const left = ifStmtPath.value.test.left;
                  if (
                    left.object.name === reqName &&
                    left.property.name === "method"
                  ) {
                    const method = ifStmtPath.value.test.right.value;
                    if (swagger || outputBoth) {
                      spec.paths[path][method.toLowerCase()] = {};
                    }

                    const varDeclarations = ifStmtPath.value.consequent.body;
                    varDeclarations.forEach((varDeclaration) => {
                      if (varDeclaration.declarations) {
                        varDeclaration.declarations.forEach((declaration) => {
                          if (declaration.init.type === "MemberExpression") {
                            if (declaration.init.object.name === reqName) {
                              const propLocation =
                                declaration.init.property.name;
                              const propList = declaration.id.properties
                                .map((prop) => prop.key.name)
                                .join(", ");
                              const propDisplay =
                                propLocation === "body"
                                  ? `{body: {${propList}}}`
                                  : `?${propList}`;

                              const routeDeclaration = `${method.toUpperCase()} \t ${path} \t ${propDisplay}`;
                              if (text || outputBoth) {
                                content.push(routeDeclaration);
                              }

                              if (swagger || outputBoth) {
                                spec.paths[path][method.toLowerCase()][
                                  "parameters"
                                ] = [];
                              }
                              declaration.id.properties.forEach((prop) => {
                                if (swagger || outputBoth) {
                                  spec.paths[path][method.toLowerCase()][
                                    "parameters"
                                  ].push({
                                    in: propLocation.toLowerCase(),
                                    name: prop.key.name,
                                  });
                                }
                              });
                            }
                          }
                        });
                      }
                    });
                  } else {
                    this.traverse(path);
                  }
                }
                this.traverse(ifStmtPath);
              },
            });
            return false;
          },
        });
        if (text || outputBoth) {
          content.push("---------------------------------");
        }
      });

      if (text || outputBoth) {
        writeFileSync("routes", content.join("\n"));
        console.log(chalk.green("routes file created"));
      }
      if (swagger || outputBoth) {
        // create swagger api file
        writeFileSync("routes.yml", yaml.dump(spec));
        console.log(chalk.green("routes.yml file created"));
      }
    })
    .catch((err) => {
      console.log(chalk.red(`[ERROR] ${err.message}`));
    });
}
module.exports = generateRoutes;

async function getFiles(dir) {
  if (!existsSync(dir)) {
    throw new Error(`${path.resolve(dir)} does not exist`);
  }
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );

  return files.flat();
}

if (require.main === module) {
  program.version("0.0.1");

  program
    .name("nextjs-routes")
    .usage("[dir]")
    .addArgument(new Argument("<dir>", "Nextjs project directory"))
    .option("-t, --text", " text docs")
    .option("-s, --swagger", "swagger docs")
    .action(function (dir, options, command) {
      generateRoutes(dir, options);
    });

  program.parse(process.argv);
}
