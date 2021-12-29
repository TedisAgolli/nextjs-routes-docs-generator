const { resolve } = require("path");
const { readdir } = require("fs").promises;
const { readFileSync, writeFileSync } = require("fs");
const { Parser } = require("acorn");
const recast = require("recast");
const yaml = require("js-yaml");

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat();
}

const content = [];
const spec = {
  swagger: "2.0",
  info: {
    title: "Swagger API",
    version: "1.0.0",
  },
  paths: {
    //     route: {
    //       METHOD: {
    //         parameters: [
    //           {
    //             in: "body",
    //             name: "body",
    //           },
    //         ],
    //       },
    //     },
  },
};
getFiles(".././pages/api/").then((files) => {
  files.forEach((file) => {
    const path = file.split("\\pages\\")[1].split(".")[0];
    content.push(file);
    spec.paths[path] = {};

    console.log(file);
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
                spec.paths[path][method.toLowerCase()] = {};

                const varDeclarations = ifStmtPath.value.consequent.body;
                varDeclarations.forEach((varDeclaration) => {
                  if (varDeclaration.declarations) {
                    varDeclaration.declarations.forEach((declaration) => {
                      if (declaration.init.type === "MemberExpression") {
                        if (declaration.init.object.name === reqName) {
                          const propLocation = declaration.init.property.name;
                          const propList = declaration.id.properties
                            .map((prop) => prop.key.name)
                            .join(", ");
                          const propDisplay =
                            propLocation === "body"
                              ? `{body: {${propList}}}`
                              : `?${propList}`;

                          const routeDeclaration = `${method.toUpperCase()} \t ${path} \t ${propDisplay}`;
                          content.push(routeDeclaration);

                          spec.paths[path][method.toLowerCase()]["parameters"] =
                            [];
                          declaration.id.properties.forEach((prop) => {
                            spec.paths[path][method.toLowerCase()][
                              "parameters"
                            ].push({
                              in: propLocation.toLowerCase(),
                              name: prop.key.name,
                            });
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
    content.push("---------------------------------");
  });
  writeFileSync("routes", content.join("\n"));
  // create swagger api file
  writeFileSync("routes.yml", yaml.dump(spec));
});
