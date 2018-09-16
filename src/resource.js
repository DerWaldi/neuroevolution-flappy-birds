var res = {
	bg: "res/bg.png",
	flappy_packer: "res/flappy_packer.png",
	flappy_packer_plist: "res/flappy_packer.plist",
	flappy_frame_plist: "res/flappy_frame.plist",
	ground: "res/ground.png",
};


// Create a list of our resources to let them preload by preloader
var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}