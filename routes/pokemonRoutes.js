const express = require('express');
const router = express.Router();
const pokemonController = require('../controllers/pokemonController');

router.get('/pokemon', pokemonController.getAllPokemon);
router.post('/pokemon', pokemonController.addPokemon);
router.post('/pokemon/:ownerName/add', pokemonController.addPokemonToUser);
router.delete('/pokemon/:ownerName', pokemonController.deletePokemon);
router.delete('/pokemon', pokemonController.deleteAllPokemon);
router.get('/pokemon-owners', pokemonController.getAllPokemonOwners);
router.get('/pokemon/:ownerName', pokemonController.getPokemonByOwner);
router.put('/pokemon/:pokemonOwnerName', pokemonController.getPokemonByOwnerAndUpdate);

module.exports = router;