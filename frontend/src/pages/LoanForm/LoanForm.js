import { makeStyles, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import React from 'react';
import { useState } from 'react';
import CollateralDocuments from './CollateralDocuments';
import ConfirmSubmission from './ConfirmSubmission';
import LoanDetails from './LoanDetails';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { createOpportunity } from '../../components/transaction/TransactionHelper';
import { requestAccount } from '../../components/navbar/NavBarHelper';
import { ethers } from 'ethers';
import NFTMinter from "../../artifacts/contracts/NFT_minter.sol/NFTMinter.json";
import axiosHttpService from '../../services/axioscall';
import { pinJSONToIPFS, uploadFileToIPFS } from '../../services/PinataIPFSOptions';
import { Button } from '@mui/material';
import { useHistory } from 'react-router-dom';
const axios = require('axios');


const useStyles = makeStyles({
    root: {
        width: "50%",
        margin: "6rem auto",
        border: "1px solid #999",
    },
    btn: {
        display: 'grid',
        width: '70%',
        margin: '0 auto 3rem auto'
    }
})


const LoanForm = () => {
    const classes = useStyles();
    const [formData, setFormData] = useState({
        loan_type: "",
        loan_amount: "",
        loan_purpose: "",
        loan_tenure: "",
        loan_interest: "",
        payment_frequency: ""
    });

    const [processed, setProcessed] = useState(false);
    const path = useHistory();

    async function onFileUpload(selectedFile, loan_purpose) {
        try {
            console.log("Upload called");
            let ipfsUploadRes = await axiosHttpService(uploadFileToIPFS(selectedFile));
            console.log(ipfsUploadRes);
            // make metadata
            const metadata = new Object();
            metadata.imageHash = ipfsUploadRes.res.IpfsHash;
            metadata.PinSize = ipfsUploadRes.res.PinSize;
            metadata.Timestamp = ipfsUploadRes.res.Timestamp;
            metadata.LoanPurpose = loan_purpose;

            //make pinata call
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
                return {
                    success: false,
                    status: "😢 Something went wrong while uploading your tokenURI.",
                }
            }
            const tokenURI = pinataResponse.hash;
            console.log('check check', tokenURI);
            // const uri = await mint_NFT(tokenURI, "https://gateway.pinata.cloud/ipfs/" + metadata.imageHash);
            // return uri;
            return tokenURI;
        } catch (error) {
            console.log(error);
        }
    };


    const [activeStep, setActiveStep] = useState(0);

    const finalSubmit = async (data) => {

        let { loan_type, loan_amount, loan_purpose, loan_tenure, loan_interest, capital_loss, payment_frequency, ...rest } = data;
        loan_tenure = loan_tenure * 30;
        const collateral_document = rest.collateral_document;
        const loanDetails = { loan_type, loan_amount, loan_purpose, loan_tenure, loan_interest, payment_frequency, capital_loss }
        console.log(collateral_document);
        console.log(loanDetails);
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        const document = await onFileUpload(collateral_document, loan_purpose);

        console.log('called', document)
        await createOpportunity(loanDetails, document);
        setProcessed(true);

    }

    const handleNext = (newData, value) => {
        if (value === true) {
            let temp = { ...formData, ...newData }
            setFormData(temp)
        }
        else {
            setFormData((prev) => ({ ...prev, ...newData }))
        }
        setActiveStep(prevActiveStep => prevActiveStep + 1)
    }

    const handlePrev = (newData) => {
        setActiveStep(prevActiveStep => prevActiveStep - 1)
    }

    const getSteps = () => {
        return ['Loan Details', 'Collateral Documents', 'Confirm Submission'];
    }

    const steps = getSteps();

    const getStepsContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return <LoanDetails handleNext={handleNext} formData={formData} ></LoanDetails>;
            case 1:
                return <CollateralDocuments
                    handleNext={handleNext} handlePrev={handlePrev} formData={formData} ></CollateralDocuments>;
            case 2:
                return <ConfirmSubmission handlePrev={handlePrev} finalSubmit={finalSubmit} formData={formData} ></ConfirmSubmission>;
            default:
                return "Unknown Step";
        }
    }

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {
                    steps.map((step, index) => (
                        <Step key={step}>
                            <StepLabel>
                                {step}
                            </StepLabel>
                        </Step>
                    ))
                }
            </Stepper>
            {activeStep === steps.length ?
                <>
                    {
                        processed ?
                            <>
                                <Typography
                                    variant='h5'
                                    style={{ color: '#999', textAlign: 'center', margin: '1rem 0' }}
                                >
                                    <CheckCircleIcon
                                        style={{ fontSize: '80px' }}
                                        color='success'
                                    ></CheckCircleIcon>
                                    <br />
                                    Loan Request Submitted Successfully
                                    <br />
                                    <Button onClick={() => path.push('/opportunities')} variant="outlined">Back to Dashboard</Button>
                                </Typography>

                            </>
                            : <Typography
                                variant='h5'
                                style={{ color: '#999', textAlign: 'center', margin: '1rem 0' }}
                            >
                                <PendingIcon
                                    style={{ fontSize: '80px' }}
                                    color='warning'
                                ></PendingIcon>
                                <br />
                                Confirm the transactions to submit Successfully
                            </Typography>
                    }
                </>
                : (
                    <>
                        {getStepsContent(activeStep)}
                    </>
                )}
        </div >
    );
};

export default LoanForm;