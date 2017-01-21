function addResource(path,type) {
	
	  $.ajax({
		  type:"POST",
		  url:"/file/add",
		  data:{
			  "path":path,
			  "type":type
		  },
		  success: function(status){
			  if(status === 'Success'){
				  create();
			  }
		  },
		  error:function(err){
			  console.log(err);
		  }
	  })
}

function saveFile(path,content) {
	
	  $.ajax({
		  type:"POST",
		  url:"/file/save",
		  data:{
			  "path":path,
			  "content":content
		  },
		  success:function(status){
			  if(status === 'Success'){ 
			  }
		  },
		  error:function(err){
			  console.log(error);
		  }
	  })
}
function removeFile(path) {
		 $.ajax({
		  type:"POST",
		  url:"/file/remove",
		  data:{
			  "path":path
		  },
		  success:function(status){
			   if(status === 'Success'){
				   create(); 
			   }
		  },
		  error:function(err){
			  console.log(error);
		  }
	  })
}

function renameFile(oldpath,newpath) {
	 	 $.ajax({
		  type:"POST",
		  url:"/file/rename",
		  data:{
			  "oldpath":oldpath,
			  "newpath":newpath
		  },
		  success:function(status){
			 if(status === 'Success'){
				 create();
			 }
		  },
		  error:function(err){
			  console.log(error);
		  }
	  })	
}