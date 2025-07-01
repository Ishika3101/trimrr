import { UrlState } from '@/context';
import {useNavigate, useSearchParams} from "react-router-dom";
import  { useEffect } from 'react'
import { useState,useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import Error from './error';
import {Card} from "./ui/card";
import * as yup from 'yup' 
import useFetch from '@/hooks/use-fetch';
import { createUrl } from '../../db/apiUrls';
import { BeatLoader } from 'react-spinners';

const CreateLink = () => {
    const {user} =UrlState();
    const navigate = useNavigate();
    const ref= useRef();
    let [searchParams,setSearchParams] = useSearchParams();
    const longLink = searchParams.get("createNew");

    const[errors, setErrors] = useState({});
    const[formValues, setFormValues] = useState({
        title:"",
        longUrl: longLink? longLink: "",
        customUrl: "",
    });

        const schema = yup.object().shape({
            title: yup.string().required("Title is required"),
            longUrl: yup
               .string()
               .url("Must be a valid URL") //(error)
               .required("Long URL is required"),
            customUrl: yup.string(),   //(no error as optional)


        });
        const handleChange = (e) => {
            setFormValues({
                ...formValues,
                [e.target.id] : e.target.value,
            });
        };

        const{
            loading,
            error,
            data,
            fn:fnCreateUrl,
        }=useFetch(createUrl, {...formValues, user_id:user.id});

        useEffect(() => {
            if(error==null && data){
                navigate(`/link${data[0].id}`);
            }
        },[error,data]);
        

        const createNewLink= async() => {
          setErrors([]);
            try{
                await schema.validate(formValues,{abortEarly:false});
                const canvas = ref.current.canvasRef.current;
                 const blob = await new Promise((resolve) => canvas.toBlob(resolve));

                 await fnCreateUrl(blob);

            }catch(e){
                 const newErrors={};

                 e?.inner?.forEach((err) => {
                    newErrors[err.path] = err;
                 });
                 setErrors(newErrors);
            }
            
        };

  return (
    
      <Dialog defaultOpen={longLink}
       onOpenChange={(res)=>{if(!res) setSearchParams({})} }
      >
         <DialogTrigger>
            <Button disabled={loading} onClick={createNewLink} variant="destructive">
                {loading ? <BeatLoader size={10} color='white' />:"Create"}
            </Button>
         </DialogTrigger>
         <DialogContent classname="sm:max-w-md">
            <DialogHeader>

                {formValues?.longUrl && <QRCode value={formValues?.longUrl} size={250} ref={ref}/>}
               <DialogTitle className='font-bold text-2xl'>Create New</DialogTitle>
               
            </DialogHeader>
               <Input id="title" placeholder="Short Link's Title"
                      value={formValues.title}
                      onChange={handleChange}/>
               {error.title && <Error message={errors.title}/>}

               <Input id="longUrl" placeholder="Enter your Loooong URL" value={formValues.longUrl}
                      onChange={handleChange}/>
               {error.longUrl && <Error message={errors.longUrl}/>}
                 
                <div className='flex items-center gap-2'>
                    <Card classname="p-2"> trimrr.in</Card>/
                    <Input id="customUrl" placeholder="Custom Link(optional)" value={formValues.customUrl}
                      onChange={handleChange}/>
                </div>
               
                {error && <Error message={error.message}/>}
                <DialogFooter className="sm: justify-start">
                    <Button onClick={createNewLink} variant="destructive">Create</Button>
                 </DialogFooter>

         </DialogContent>
       </Dialog>
    
    
)};

export default CreateLink
