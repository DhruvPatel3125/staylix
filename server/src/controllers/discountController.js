const Discount = require("../models/discount.js");

exports.createDiscount = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minBookingAmount,
      applicableHotels,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !description || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Code, description, discountValue, startDate, and endDate are required",
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const existingCode = await Discount.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Discount code already exists",
      });
    }

    const discount = await Discount.create({
      code: code.toUpperCase(),
      description,
      discountType: discountType || "percentage",
      discountValue,
      minBookingAmount: minBookingAmount || 0,
      applicableHotels: applicableHotels || [],
      startDate,
      endDate,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
      requestStatus: "approved",
    });

    res.status(201).json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error("Create discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create discount",
    });
  }
};

exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().populate(
      "applicableHotels",
      "name"
    );
    res.json({
      success: true,
      discounts,
    });
  } catch (error) {
    console.error("Get discounts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discounts",
    });
  }
};

exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id).populate(
      "applicableHotels",
      "name"
    );

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    res.json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error("Get discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount",
    });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minBookingAmount,
      applicableHotels,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    if (code && code.toUpperCase() !== discount.code) {
      const existingCode = await Discount.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "Discount code already exists",
        });
      }
    }

    const updateData = {
      code: code ? code.toUpperCase() : discount.code,
      description: description || discount.description,
      discountType: discountType || discount.discountType,
      discountValue:
        discountValue !== undefined ? discountValue : discount.discountValue,
      minBookingAmount:
        minBookingAmount !== undefined
          ? minBookingAmount
          : discount.minBookingAmount,
      applicableHotels:
        applicableHotels !== undefined
          ? applicableHotels
          : discount.applicableHotels,
      startDate: startDate || discount.startDate,
      endDate: endDate || discount.endDate,
      usageLimit: usageLimit !== undefined ? usageLimit : discount.usageLimit,
      isActive: isActive !== undefined ? isActive : discount.isActive,
    };

    const updatedDiscount = await Discount.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("applicableHotels", "name");

    res.json({
      success: true,
      discount: updatedDiscount,
    });
  } catch (error) {
    console.error("Update discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discount",
    });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    await Discount.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (error) {
    console.error("Delete discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete discount",
    });
  }
};

exports.toggleDiscountStatus = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    res.json({
      success: true,
      message: `Discount ${discount.isActive ? "activated" : "deactivated"
        } successfully`,
      discount,
    });
  } catch (error) {
    console.error("Toggle discount status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle discount status",
    });
  }
};

// Owner requests a discount
exports.requestDiscount = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minBookingAmount,
      applicableHotels,
      startDate,
      endDate,
      usageLimit,
    } = req.body;

    if (!code || !description || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Code, description, discountValue, startDate, and endDate are required",
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const existingCode = await Discount.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Discount code already exists",
      });
    }

    const discount = await Discount.create({
      code: code.toUpperCase(),
      description,
      discountType: discountType || "percentage",
      discountValue,
      minBookingAmount: minBookingAmount || 0,
      applicableHotels: applicableHotels || [],
      startDate,
      endDate,
      usageLimit: usageLimit || null,
      isActive: false,
      createdBy: req.user._id,
      requestedBy: req.user._id,
      requestStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Discount request submitted successfully",
      discount,
    });
  } catch (error) {
    console.error("Request discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request discount",
    });
  }
};

// Admin approves a discount request
exports.approveDiscountRequest = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    if (discount.requestStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Discount request is not pending",
      });
    }

    discount.requestStatus = "approved";
    discount.isActive = true;
    await discount.save();

    res.json({
      success: true,
      message: "Discount request approved successfully",
      discount,
    });
  } catch (error) {
    console.error("Approve discount request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve discount request",
    });
  }
};

// Admin rejects a discount request
exports.rejectDiscountRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    if (discount.requestStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Discount request is not pending",
      });
    }

    discount.requestStatus = "rejected";
    discount.isActive = false;
    discount.rejectionReason = reason || "No reason provided";
    await discount.save();

    res.json({
      success: true,
      message: "Discount request rejected",
      discount,
    });
  } catch (error) {
    console.error("Reject discount request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject discount request",
    });
  }
};

// Validate discount code
exports.validateDiscount = async (req, res) => {
  try {
    const { code, bookingAmount, hotelId } = req.body;

    if (!code || !bookingAmount) {
      return res.status(400).json({
        success: false,
        message: "Code and booking amount are required",
      });
    }

    const discount = await Discount.findOne({ code: code.toUpperCase() });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Invalid discount code",
      });
    }

    // Check if discount is approved
    if (discount.requestStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Discount code is not approved",
      });
    }

    // Check if discount is active
    if (!discount.isActive) {
      return res.status(400).json({
        success: false,
        message: "Discount code is inactive",
      });
    }

    // Check date validity
    const now = new Date();
    if (
      now < new Date(discount.startDate) ||
      now > new Date(discount.endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount code has expired or not yet valid",
      });
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Discount code usage limit reached",
      });
    }

    // Check minimum booking amount
    if (bookingAmount < discount.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking amount of $${discount.minBookingAmount} required`,
      });
    }

    // Check applicable hotels
    if (
      hotelId &&
      discount.applicableHotels &&
      discount.applicableHotels.length > 0
    ) {
      const isApplicable = discount.applicableHotels.some(
        (id) => id.toString() === hotelId.toString()
      );
      if (!isApplicable) {
        return res.status(400).json({
          success: false,
          message: "Discount code not applicable to this hotel",
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === "percentage") {
      discountAmount = (bookingAmount * discount.discountValue) / 100;
    } else {
      discountAmount = discount.discountValue;
    }

    // Ensure discount doesn't exceed booking amount
    discountAmount = Math.min(discountAmount, bookingAmount);

    res.json({
      success: true,
      message: "Discount code is valid",
      discount: {
        code: discount.code,
        description: discount.description,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        discountAmount,
        finalAmount: bookingAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error("Validate discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate discount",
    });
  }
};

// Get owner's discount requests
exports.getOwnerRequests = async (req, res) => {
  try {
    const discounts = await Discount.find({ requestedBy: req.user._id })
      .populate("applicableHotels", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      discounts,
    });
  } catch (error) {
    console.error("Get owner requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount requests",
    });
  }
};

// Get active discounts (public)
exports.getActiveDiscounts = async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      requestStatus: "approved",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).populate("applicableHotels", "name");

    res.json({
      success: true,
      discounts,
    });
  } catch (error) {
    console.error("Get active discounts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active discounts",
    });
  }
};
