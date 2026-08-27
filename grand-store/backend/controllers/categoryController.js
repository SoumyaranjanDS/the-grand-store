const getCategories = (req, res) => {
  const categories = [
    { id: 1, name: 'Whisky', icon: 'glass-tulip' },
    { id: 2, name: 'Wine', icon: 'glass-wine' },
    { id: 3, name: 'Champagne', icon: 'glass-flute' },
    { id: 4, name: 'Cognac', icon: 'glass-tulip' },
    { id: 5, name: 'Brandy', icon: 'glass-cocktail' },
    { id: 6, name: 'Gin', icon: 'bottle-wine-outline' },
    { id: 7, name: 'Liqueur', icon: 'bottle-tonic-outline' },
    { id: 8, name: 'Rum', icon: 'bottle-tonic' },
    { id: 9, name: 'Tequila', icon: 'glass-cocktail' },
    { id: 10, name: 'Vodka', icon: 'bottle-wine' },
    { id: 11, name: 'Ciders', icon: 'bottle-soda' },
    { id: 12, name: 'Spirits', icon: 'glass-cocktail' },
    { id: 13, name: 'Scotch', icon: 'glass-tulip' },
    { id: 14, name: 'View All', icon: 'view-grid-outline' }
  ];

  res.status(200).json({
    status: 1,
    data: categories
  });
};

module.exports = {
  getCategories
};
