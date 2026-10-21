const xlsx = require('xlsx');
const Income = require("../models/Income");
//add income source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try{
        const {icon, source, amount, date} = req.body;
        
        //validating that we get all the fields
        if(!source || !amount||!date){
            return res.status(400).json({message:"All fields are required"});
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date),
        });

        await newIncome.save();
        res.status(200).json(newIncome);


    }catch(error){
        res.status(500).json({message: "Server error"});
    }
}

//get all income sources
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try{
        const income = await Income.find({userId}).sort({date: -1});
        res.json(income);
    }catch(error){
        res.status(500).json({message: "Server error"});
    }
}

//delete income source
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!income) {
            return res.status(404).json({
                message: "Income not found"
            });
        }

        return res.json({
            message: "Income deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

//Download Excel
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;

    try{
        const income = await Income.find({userId}).sort({date:-1});

        //preparing the data for excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        xlsx.writeFile(wb, 'income_details.xlsx');
        res.download('income_details.xlsx');

    }catch(error){
        res.status(500).json({message: "Server error"});
    }
}
