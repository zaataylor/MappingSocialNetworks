//Generates a force-directed graph of friend network using d3.js

//Wait for start button to be clicked
var button = document.getElementById('startButton');

button.onclick = function () {
    chrome.runtime.sendMessage({ from: "viz" }, function (response) {

        //put JSON data in proper format
        var friendData = response.data[0];

        //will hold all graph data
        var data = {
            nodes: [],
            links: []
        }

        //select the svg element on the page and make the d3 svg object have its width and height
        const svg = d3.select("svg")
        const width = svg.attr("width");
        const height = svg.attr("height");


        //last person in friendData will be the current user, and all other friends will be in their 
        //mutual friends array
        var id = 0;
        friendData[friendData.length - 1].mutualFriends.forEach(person => {
            // give each node a random position
            person.x = Math.random() * width;
            person.y = Math.random() * height;
            //compute number of mutual friends and store it as a property
            person.value = person.mutualFriends.length;
            //give each person an id corresponding to position in array
            person.id = id;
            id++;

            //push to data.nodes array
            data.nodes.push(person)
        });

        //Push the current user to the nodes array as well
        var currentUser = friendData[friendData.length - 1];
        currentUser.x = Math.random() * width;
        currentUser.y = Math.random() * height;
        currentUser.value = currentUser.mutualFriends.length;
        currentUser.id = id;
        data.nodes.push(currentUser)

        //for each node in the list
        data.nodes.forEach(userNode => {
            //go through their mutual friends list
            userNode.mutualFriends.forEach(mutual => {
                //check to see if mutual friend's fbID matches one in nodes
                data.nodes.forEach(friend => {
                    //if it does, push the source (userNode) and target (the mutual friend) to links array
                    if (friend.fbID === mutual.fbID) {
                        data.links.push({ source: userNode.id, target: friend.id })
                    }
                })
            })
        })


        //logging final links and node data to verify correctness
        console.log(data.links)
        console.log(data.nodes)

        //dragging behavior(s)
        var drag = d3.drag()
            .on("drag", function (d, i) {
                d.x += d3.event.x;
                d.y += d3.event.y;
                d3.select(this).attr("cx", d.x).attr("cy", d.y);
                links.each(function (l, li) {
                    if (l.source == i) {
                        d3.select(this).attr("x1", d.x).attr("y1", d.y);
                    } else if (l.target == i) {
                        d3.select(this).attr("x2", d.x).attr("y2", d.y);
                    }
                })
            })

        //links on the graph
        var links = svg.selectAll(".link")
            .data(data.links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("x1", function (l) {
                //filter method returns an array of elements based on things that pass
                //the test specified as a callback in the function. We only want the first
                //element in array of return values whose value corresponds to the desired source 
                //node
                var sourceNode = data.nodes.filter(function (d, i) {
                    return i == l.source;
                })[0];
                //select the line element we're working with and set its y1 attribute
                d3.select(this).attr("y1", sourceNode.y);
                return sourceNode.x;
            })
            .attr("x2", function (l) {
                var targetNode = data.nodes.filter(function (d, i) {
                    return i == l.target;
                })[0];
                d3.select(this).attr("y2", targetNode.y);
                return targetNode.x;
            })
            .attr("stroke", "black")

        var nodes = svg.selectAll(".node")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            //set center x and y coordinates for each circle to correspond to the
            // x and y coordinate properties of each datum
            .attr("cx", function (d) { return d.x })
            .attr("cy", function (d) { return d.y })
            //.attr("r", function (d) { return Math.ceil(Math.sqrt(d.value)) })
            .attr("r", 7.5)
            .attr("fill", "red")
            .append("title").text(function (d) { return d.name })
            .call(drag)
    })
}
