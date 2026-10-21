const xlsx = require('xlsx');
const Expense = require("../models/Expense");
//add Expense category
exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const {icon, category, amount, date} = req.body;
        
        //validating that we get all the fields
        if(!category || !amount||!date){
            return res.status(400).json({message:"All fields are required"});
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date),
        });

        await newExpense.save();
        res.status(200).json(newExpense);


    }catch(error){
        res.status(500).json({message: "Server error"});
    }
}

//get all Expense categorys
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const expense = await Expense.find({userId}).sort({date: -1});
        res.json(expense);
    }catch(error){
        res.status(500).json({message: "Server error"});
    }
}

//delete Expense category
//deletion handlers use findByIdAndDelete(req.params.id) without verifying that the record belongs to the authenticated user. The routes require authentication, but authentication alone is not authorization. 
//Fix: Include the authenticated owner's ID in the database query, and return 404 if no matching record is found.

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        return res.json({
            message: "Expense deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

//Download Excel
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;

    try{
        const expense = await Expense.find({userId}).sort({date:-1});

        //preparing the data for excel
        const data = expense.map((item) => ({
            category: item.category,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "expense");
        xlsx.writeFile(wb, 'expense_details.xlsx');
        res.download('expense_details.xlsx');

    }catch(error){
        res.status(500).json({message: "Server error"});
    }
}
