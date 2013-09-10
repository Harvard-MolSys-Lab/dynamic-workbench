module("App.LiveTaskRunner");
test("runTask", function() {
	stop()
	console.log("Testing task `Simple`")
	started = App.runTask('Simple',{},function() {
		console.log(arguments)
		ok(true,"Task completed")
		start()
	})

	ok(started, "Tool is loaded on client and Task is initialized")
});