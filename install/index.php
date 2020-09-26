<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>app-geordnet App Installation</title>
    <meta name="description" content="description here">
    <meta name="keywords" content="keywords,here">
	
    <link href="https://fonts.googleapis.com/css?family=Nunito:400,700,800" rel="stylesheet">
	<meta name="msapplication-TileColor" content="#00aba9">
	<meta name="theme-color" content="#3b7977">

    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
    <link href="https://unpkg.com/tailwindcss@next/dist/tailwind.min.css" rel="stylesheet"> <!--Replace with your tailwind.css once created-->


</head>
<body class="bg-gray-100 font-sans leading-normal tracking-normal">

<nav id="header" class="bg-white fixed w-full z-10 top-0 shadow">
	

		<div class="w-full container mx-auto flex flex-wrap items-center mt-0 pt-3 pb-3 md:pb-0">
				
			<div class="w-1/2 pl-2 md:pl-0">
				<a class="text-gray-900 text-base xl:text-xl no-underline hover:no-underline font-bold"  href="#"> 
					app-geordnet App Installation
				</a>
            </div>
			<div class="w-1/2 pr-0">
				
			</div>


			<div class="w-full flex-grow lg:flex lg:items-center lg:w-auto hidden lg:block mt-2 lg:mt-0 bg-white z-20" id="nav-content">
				<ul class="list-reset lg:flex flex-1 items-center px-4 md:px-0">
					<li class="mr-6 my-2 md:my-0">
                        <a href="/" class="block py-1 md:py-3 pl-1 align-middle text-gray-500 no-underline hover:text-gray-900 border-b-2 border-white hover:border-pink-500">
                            <i class="fas fa-home fa-fw mr-3"></i><span class="pb-1 md:pb-0 text-sm">Home</span>
                        </a>
                    </li>
					<li class="mr-6 my-2 md:my-0">
                        <a href="#" class="block py-1 md:py-3 pl-1 align-middle text-orange-600 no-underline hover:text-gray-900 border-b-2 border-orange-600 hover:border-orange-600">
                            <i class="fas fa-tasks fa-fw mr-3 text-orange-600"></i><span class="pb-1 md:pb-0 text-sm">Installation</span>
                        </a>
                    </li>
				</ul>
			</div>
			
		</div>
	</nav>

	<!--Container-->
	<div class="container w-full mx-auto pt-20">
		
		<div class="w-full px-4 md:px-0 md:mt-8 mb-16 text-gray-800 leading-normal">
			
			<!--Console Content-->
			
			<div class="flex flex-wrap">
                <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                    <!--Metric Card-->
                    <a href="itms-services://?action=download-manifest&url=https://2018.app-geordnet.de/install/appgeordnet.plist">
                    <div class="bg-white border rounded shadow p-2 cursor-pointer">
                        <div class="flex flex-row items-center">
                            <div class="flex-shrink pr-4">
                                <div class="rounded p-3 bg-green-600"><i class="fab fa-apple fa-2x fa-fw fa-inverse"></i></div>
                            </div>
                            <div class="flex-1 text-right md:text-center">
                                <h5 class="font-bold text-gray-500">iOS</h5>
                                <h3 class="font-bold text-3xl">2.2.0 (I) <span class="text-green-500"><i class="fas fa-cloud-download-alt"></i></span></h3>
                            </div>
                        </div>
                    </div>
                    </a>
                    <!--/Metric Card-->
                </div>
                <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                    <!--Metric Card-->
                    <a href="itms-services://?action=download-manifest&url=https://2018.app-geordnet.de/install/appgeordnet-monaca.plist">
                    <div class="bg-white border rounded shadow p-2 cursor-pointer">
                        <div class="flex flex-row items-center">
                            <div class="flex-shrink pr-4">
                                <div class="rounded p-3 bg-orange-600"><i class="fab fa-apple fa-2x fa-fw fa-inverse"></i></div>
                            </div>
                            <div class="flex-1 text-right md:text-center">
                                <h5 class="font-bold text-gray-500">iOS</h5>
                                <h3 class="font-bold text-3xl">2.2.0 (II) <span class="text-orange-500"><i class="fas fa-cloud-download-alt"></i></span></h3>
                            </div>
                        </div>
                    </div>
                    </a>
                    <!--/Metric Card-->
                </div>
                <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                    <!--Metric Card-->
                    <a href="https://2018.app-geordnet.de/install/20200925223431-app-release.apk">
                    <div class="bg-white border rounded shadow p-2">
                        <div class="flex flex-row items-center">
                            <div class="flex-shrink pr-4">
                                <div class="rounded p-3 bg-yellow-600"><i class="fab fa-android fa-2x fa-fw fa-inverse"></i></div>
                            </div>
                            <div class="flex-1 text-right md:text-center">
                                <h5 class="font-bold uppercase text-gray-500">Android</h5>
                                <h3 class="font-bold text-3xl">2.2.0 <span class="text-yellow-600"><i class="fas fa-cloud-download-alt"></i></span></h3>
                            </div>
                        </div>
                    </div>
                    </a>
                    <!--/Metric Card-->
                </div>
            </div>

			<!--Divider-->
			<hr class="border-b-2 border-gray-400 my-8 mx-4">

								
			<!--/ Console Content-->
					
		</div>
		

	</div> 
	<!--/container-->
<!--	
	<footer class="bg-white border-t border-gray-400 shadow">	
		<div class="container max-w-md mx-auto flex py-8">

			<div class="w-full mx-auto flex flex-wrap">
				<div class="flex w-full md:w-1/2 ">
					<div class="px-8">
						<h3 class="font-bold font-bold text-gray-900">About</h3>
						<p class="py-4 text-gray-600 text-sm">
							Cesart
						</p>
					</div>
				</div>
				
				<div class="flex w-full md:w-1/2">
					<div class="px-8">
					</div>
				</div>
			</div>
        

		
		</div>
	</footer>
-->

</body>
</html>
