const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  
  deployer.deploy(Migrations, { overwrite: false });

  //process.stdout.write('\nDireccion Migrations: ' + Migrations.address);
};
