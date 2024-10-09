const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const { Employee, Asset, AssetCategory, IssuedAssetHistory, ScrapAsset, AssetHistory } = require('./models');
const employee = require('./models/employee');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For Bootstrap and CSS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const sequelize = new Sequelize('asset_tracking_db', 'postgres', 'ap@1099*', {
  host: 'localhost',
  dialect: 'postgres',
});


// Set view engine to Jade (Pug)
app.set('view engine', 'jade');
app.set('views', './views');

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Asset Tracking System' });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Utility function to log asset history
async function logAssetHistory(assetId, action, employeeId = null, description = null) {
  try {
    await AssetHistory.create({
      assetId,
      action,
      employeeId,
      description,
      timestamp: new Date()  // This can be automatic in DB as well
    });
    console.log('Asset history logged successfully');
  } catch (error) {
    console.error('Error logging asset history:', error);
  }
}



// Employee Master

//  Employees with Filter Capabilities
app.get('/employees', async (req, res) => {
    const { status, search } = req.query;
    let whereClause = {};

    if (status) {
        whereClause.status = status === 'active' ? true : false;
    }

    if (search) {
        whereClause.name = { [Op.iLike]: `%${search}%` }; // Sequelize iLike for case-insensitive search
    }

    const employees = await Employee.findAll({ where: whereClause });
    res.render('employees', { title: 'Employee Master', employees, search, status });
});

// Route to handle form submission (Add Employee)
app.post('/employees/add', async (req, res) => {
    const { name, email, status } = req.body;

    try {
        // Insert into the database
        await Employee.create({
            name,
            email,
            status: status === 'active'
        });

        // Redirect back to the employees page
        res.redirect('/employees');
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).send('Error adding employee');
    }
});

// Edit Employee Route
app.post('/employees/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, status } = req.body;
    await Employee.update({ name, email, status: status === 'active' }, { where: { id } });
    res.redirect('/employees');
});

// Route to Delete Employee
app.post('/employees/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Employee.destroy({ where: { id } });
    res.redirect('/employees');
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).send('Server Error');
  }
});






//Asset MAster
// Route to View Assets (with filter and search)
app.get('/assets', async (req, res) => {
  try {
    const { assetType, make, model } = req.query;
    
    // Search and filter query logic
    const query = {};
    if (assetType) query.assetType = assetType;
    if (make) query.make = make;
    if (model) query.model = model;
    
    // Fetch all asset categories
    const categories = await AssetCategory.findAll();
    const assets = await Asset.findAll({ where: query });
    
    
    // Render the Asset Master page, passing the categories to the view
    res.render('assets', {
      title: 'Asset Master',
      categories, // Pass the categories to the view
      assets // You can fetch the assets similarly
    });
    
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).send('Server Error');
  }
});

// Route to Add Asset
app.post('/assets/add', async (req, res) => {
  const { serialNumber, uniqueId, make, model, assetType, status, branch, value } = req.body;

  try {
    await Asset.create({
      serialNumber, uniqueId, make, model, assetType, status, branch, value
    });
    res.redirect('/assets');
  } catch (err) {
    console.error('Error adding asset:', err);
    res.status(500).send('Server Error');
  }
});

// Route to Edit Asset
app.post('/assets/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { serialNumber, uniqueId, make, model, assetType, status, branch, value } = req.body;

  try {
    const asset = await Asset.findByPk(id);
    if (asset) {
      await asset.update({
        serialNumber, uniqueId, make, model, assetType, status, branch, value
      });
    }
    res.redirect('/assets');
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).send('Server Error');
  }
});

// Route to Delete Asset
app.post('/assets/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Asset.destroy({ where: { id } });
    res.redirect('/assets');
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).send('Server Error');
  }
});



//Category field
//List all categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await AssetCategory.findAll();
    res.render('categories', { 
      title: 'Asset Category Master', // This will define the title variable
      categories // Pass categories to the view
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Error fetching categories');
  }
});

//Add a new category
app.post('/categories/add', async (req, res) => {
  const { name } = req.body;
  try {
    await AssetCategory.create({ name });
    res.redirect('/categories');
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Error adding category');
  }
});

//Edit an existing category
app.post('/categories/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await AssetCategory.update({ name }, { where: { id } });
    res.redirect('/categories');
  } catch (error) {
    console.error('Error editing category:', error);
    res.status(500).send('Error editing category');
  }
});


//Deleting Category
app.post('/categories/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await AssetCategory.destroy({ where: { id } });
    res.redirect('/categories'); // Redirect after deleting
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Error deleting category');
  }
});





//form to issue an asset
app.get('/issue-asset', async (req, res) => {
  try {
    
    const employees = await Employee.findAll(); // Fetch all employees
    const assets = await Asset.findAll({ where: { status: 'active' } }); // Fetch assets that are in stock
    const issuedAssets = await IssuedAssetHistory.findAll({
      where: {
        returnedDate: null, // Assets that have not yet been returned
      },
      include: [
        {
          model: Employee,
          as: 'employee',
        },
        {
          model: Asset,
          as: 'asset',
        }
      ]
    });
  
    

    res.render('issue-asset', { title: 'Issue Asset', employees, assets, issuedAssets, });
  } catch (error) {
    console.error('Error fetching data for issue asset page:', error);
    res.status(500).send('Error fetching data');
  }
});



//form submission to issue an asset
app.post('/issue-asset', async (req, res) => {
  const { employeeId, assetId, employeeName } = req.body;

  try {
    // Update the asset's status and assign it to the employee
    /*await Asset.update(
    { employeeId: employeeId },
      { where: { id: assetId } }
   ); */

    //Insert the issuance record into IssuedAssetHistory
    await IssuedAssetHistory.create({
      assetId: assetId,
      employeeId: employeeId,
        //employeeName: employee.name,
      issuedDate: new Date(),  // Current date as the issued date
    });

    // Log the asset issue action in AssetHistory
    await logAssetHistory(assetId, 'issued', employeeId, `Asset issued to employee ${employeeId}`);

    res.redirect('/issue-asset'); 
  } catch (error) {
    console.error('Error issuing asset:', error);
    res.status(500).send('Error issuing asset');
  }
});


// Route to render the return asset page and show assets pending return
app.get('/return-asset', async (req, res) => {
  try {


    const returnedAssets = await IssuedAssetHistory.findAll({
      include: [
        {
          model: Employee,
          as: 'employee',
        },
        {
          model: Asset,
          as: 'asset',
        }
      ],
    });

    // Fetch issued assets that haven't been returned
    
    const issuedAssets = await IssuedAssetHistory.findAll({
      where: {
        returnedDate: null, // Assets that have not yet been returned
      },
      include: [
        {
          model: Employee,
          as: 'employee',
        },
        {
          model: Asset,
          as: 'asset',
        }
      ],
    });

    res.render('returnAsset', {title: 'Return Asset', issuedAssets, returnedAssets });
  } catch (error) {
    console.error('Error fetching issued assets:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle returning an asset
app.post('/return-asset', async (req, res) => {
  try {
    const { issuedAssetId, returnReason, returnDate } = req.body;

    // Find the issued asset entry and update it with the return date and reason
    const issuedAsset = await IssuedAssetHistory.findByPk(issuedAssetId);

    if (!issuedAsset) {
      return res.status(404).send('Issued asset not found');
    }

    // Update issued asset record with return information
    issuedAsset.returnedDate = returnDate;
    issuedAsset.returnReason = returnReason;

    await issuedAsset.save();

    // Log the return action in AssetHistory
    await logAssetHistory(issuedAsset.assetId, 'returned', issuedAsset.employeeId, `Return reason: ${returnReason}`);

    res.redirect('/return-asset');
  } catch (error) {
    console.error('Error returning asset:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to mark an asset as scrapped
app.post('/assets/scrap/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    
    // Find the asset and update its status to scrapped
    const asset = await Asset.findByPk(assetId);
    
    if (!asset) {
      return res.status(404).send('Asset not found');
    }

    asset.isScrapped = true; // Mark the asset as scrapped
    asset.status = 'inactive'
    await asset.save();

    // Log the scrapping action in AssetHistory
    await logAssetHistory(assetId, 'scrapped', null, 'Asset marked as obsolete');

    res.redirect('/assets'); // Redirect to assets page
  } catch (error) {
    console.error('Error scrapping asset:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to view scrapped assets
app.get('/assets/scrapped', async (req, res) => {
  try {
    const scrappedAssets = await Asset.findAll({
      where: {
        isScrapped: true
      }
    });

    res.render('scrappedAssets', {title: 'Scrapped Asset Report', scrappedAssets });
  } catch (error) {
    console.error('Error fetching scrapped assets:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Route to unmark an asset as scrapped
app.post('/scraped/delete/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    
    // Find the asset and update its status to scrapped
    const asset = await Asset.findByPk(assetId);
    
    if (!asset) {
      return res.status(404).send('Asset not found');
    }

    asset.isScrapped = false; // Mark the asset as not scrapped
    asset.status = 'active'
    await asset.save();

    res.redirect('/assets/scrapped'); // Redirect to scrapped assets page
  } catch (error) {
    console.error('Error scrapping asset:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to display asset history
app.get('/asset-history', async (req, res) => {
  try {

    const histories = await AssetHistory.findAll();
    res.render('assetHistory', {title: 'Asset History', histories });
  } catch (error) {
    console.error('Error fetching asset history:', error);
    res.status(500).send('Internal Server Error');
  }
});




// Route to render the stock view page
app.get('/stock-view', async (req, res) => {
  try {
    // Fetch assets from the database, grouped by branch and asset type
    const branches = await Asset.findAll({
      attributes: [
        'branch',
        'assetType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        [sequelize.fn('SUM', sequelize.col('value')), 'totalValue'],
      ],
      group: ['branch', 'assetType'],
    });

    // Calculate overall totals
    //const totalAssets = branches.reduce((acc, branch) => acc + branch.dataValues.totalCount, 0);
    const totalAssets = branches.reduce((acc, branch) => acc + parseInt(branch.dataValues.totalCount), 0);
    const totalValue = branches.reduce((acc, branch) => acc + parseFloat(branch.dataValues.totalValue), 0);

    // Render the stock view page with fetched data
    res.render('stockView', { title: 'Stock View', branches, totalAssets, totalValue });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).send('Internal Server Error');
  }
});
