const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'data.json');

// Utility function to read data
const readData = async () => {
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data);
};

// Utility function to write data
const writeData = async (data) => {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
};

exports.getAllPokemon = async (req, res) => {
  try {
    const pokemonList = await readData();
    res.json(pokemonList);
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    res.status(500).json({ message: 'Error fetching Pokemon', error: error.message });
  }
};

exports.deletePokemon = async (req, res) => {
  try {
    const { ownerName } = req.params;
    let pokemonList = await readData();
    pokemonList = pokemonList.filter(user => user.pokemonOwnerName !== ownerName);
    await writeData(pokemonList);
    res.json({ message: 'Pokemon user deleted successfully' });
  } catch (error) {
    console.error('Error deleting Pokemon user:', error);
    res.status(500).json({ message: 'Error deleting Pokemon user', error: error.message });
  }
};

exports.deleteAllPokemon = async (req, res) => {
  try {
    await writeData([]);
    res.json({ message: 'All Pokemon users deleted successfully' });
  } catch (error) {
    console.error('Error deleting all Pokemon users:', error);
    res.status(500).json({ message: 'Error deleting all Pokemon users', error: error.message });
  }
};

exports.addPokemon = async (req, res) => {
  try {
    const newPokemon = req.body;
    console.log('Received new Pokemon data:', newPokemon);

    // Validate input
    const requiredFields = ['pokemonOwnerName', 'pokemonName', 'pokemonAbility', 'initialPositionX', 'initialPositionY', 'speed', 'direction'];
    for (let field of requiredFields) {
      if (!newPokemon[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    // Read existing data
    let pokemonList = await readData();

    // Find if the owner already exists
    let ownerIndex = pokemonList.findIndex(entry => entry.pokemonOwnerName === newPokemon.pokemonOwnerName);

    if (ownerIndex !== -1) {
      // If owner exists, ensure they have a pokemons array, then add new pokemon
      if (!pokemonList[ownerIndex].pokemons) {
        pokemonList[ownerIndex].pokemons = [];
      }
      pokemonList[ownerIndex].pokemons.push(newPokemon);
    } else {
      // If owner doesn't exist, add new entry
      pokemonList.push({ 
        pokemonOwnerName: newPokemon.pokemonOwnerName, 
        pokemons: [newPokemon] 
      });
    }

    console.log('Updated Pokemon list:', pokemonList);
    await writeData(pokemonList);

    res.status(201).json({ message: 'Pokemon added successfully' });
  } catch (error) {
    console.error('Error adding Pokemon:', error);
    res.status(500).json({ message: 'Error adding Pokemon', error: error.message });
  }
};

exports.addPokemonToUser = async (req, res) => {
  try {
    const { ownerName } = req.params;
    const newPokemon = req.body;
    let pokemonList = await readData();
    
    const ownerIndex = pokemonList.findIndex(user => user.pokemonOwnerName === ownerName);
    if (ownerIndex === -1) {
      return res.status(404).json({ message: 'Pokemon owner not found' });
    }

    for (let i = 0; i < newPokemon.noOfPokemon; i++) {
      pokemonList[ownerIndex].pokemons.push({
        pokemonName: newPokemon.pokemonName,
        pokemonAbility: newPokemon.pokemonAbility,
        initialPositionX: 0,
        initialPositionY: 0,
        speed: 10,
        direction: 'north'
      });
    }

    await writeData(pokemonList);
    res.status(201).json({ message: 'Pokemon added to user successfully' });
  } catch (error) {
    console.error('Error adding Pokemon to user:', error);
    res.status(500).json({ message: 'Error adding Pokemon to user', error: error.message });
  }
};

exports.getAllPokemonOwners = async (req, res) => {
  try {
    const pokemonList = await readData();
    const owners = pokemonList.map(entry => ({
      pokemonOwnerName: entry.pokemonOwnerName,
      pokemonCount: entry.pokemons.length
    }));
    res.json(owners);
  } catch (error) {
    console.error('Error fetching Pokemon owners:', error);
    res.status(500).json({ message: 'Error fetching Pokemon owners', error: error.message });
  }
};

exports.getPokemonByOwner = async (req, res) => {
  try {
    const { ownerName } = req.params;
    const pokemonList = await readData();
    
    const ownerData = pokemonList.find(entry => entry.pokemonOwnerName === ownerName);
    
    if (!ownerData) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    const pokemonDetails = ownerData.pokemons.map(pokemon => ({
      name: pokemon.pokemonName,
      ability: pokemon.pokemonAbility
    }));
    
    const response = {
      ownerName: ownerData.pokemonOwnerName,
      pokemonCount: ownerData.pokemons.length,
      pokemon: pokemonDetails
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching Pokemon by owner:', error);
    res.status(500).json({ message: 'Error fetching Pokemon by owner', error: error.message });
  }
};

exports.getPokemonByOwnerAndUpdate = async (req, res) => {
  try {
    const { pokemonOwnerName } = req.params;
    const updateData = req.body;
    console.log("This is the updateData ::::",updateData);
    let pokemonList = await readData();
    
    const ownerIndex = pokemonList.findIndex(entry => entry.pokemonOwnerName === pokemonOwnerName);
    
    if (ownerIndex === -1) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    // Update the owner's data
    pokemonList[ownerIndex] = { ...pokemonList[ownerIndex], ...updateData };
    
    // Write the updated data back to the file
    await writeData(pokemonList);
    
    res.json({ 
      message: 'Pokemon owner data updated successfully',
      updatedData: pokemonList[ownerIndex]
    });
  } catch (error) {
    console.error('Error updating Pokemon owner data:', error);
    res.status(500).json({ message: 'Error updating Pokemon owner data', error: error.message });
  }
};