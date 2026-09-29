import userModel from "../models/user.model.js"

export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body
        if(!name || !email || !password) {
            return res.status(400).json({
                message: "missing details",
                success: false
            })
        }
        const existingUser = await userModel.findOne({email})
        if(existingUser) {
            return res.status(409).json({
                message: "email already exists",
                success: false
            })
        }
        const user = await userModel.create({
            name, email, password
        })
        return res.status(201).json({
            message: "user registered successfully",
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "error in register API",
            success: false
        })
    }
}