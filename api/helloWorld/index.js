/**
 * User
 * @author: Cristian Moreno Zuluaga <khriztianmoreno@gmail.com>
 */

const Router = require('express').Router;
const controller = require('./helloWorld.controller');

const router = new Router();

router.get('/', controller.index);

module.exports = router;
