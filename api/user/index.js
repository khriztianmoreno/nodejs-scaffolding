/**
 * User
 * @author: Cristian Moreno Zuluaga <khriztianmoreno@gmail.com>
 */

const Router = require('express').Router;
const controller = require('./user.controller');
const auth = require('./../../auth/auth.service');

const router = new Router();

router.get('/', controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;
