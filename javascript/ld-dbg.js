/*
 * Ubiquity provides a standards-based suite of browser enhancements for
 * building a new generation of internet-related applications.
 * Copyright (C) 2007-8 Mark Birbeck
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Mark Birbeck can be contacted at:
 *
 *  36 Tritton Road
 *  London
 *  SE21 8DE
 *  United Kingdom
 *
 *  mark.birbeck@gmail.com
 */

/*
 * This triple store is very basic, and simply holds a list of triples. All resources are
 * placed in a list, and an index is used in the triple list.
 */

function RDFGraph() {
    this.resources = [ ];
    this.triples = [ ];
    this.somenum = 0;

    /*
     * Find the index for a resource.
     */

    this.resources.find = function(sURI)
    {
        for (var i = 0, len = this.length; i < len; i++) 
        {
            if (this[i].resource == sURI)
                return i;
        }
        return -1;
    };//find


    /*
     * Add a resource to our list of resources, returning an index.
     * For each resource we keep a list of triples that make use
     * of it.
     */

    this.resources.add = function(sURI) 
    {
        return this.push(
            {
                resource: sURI,
                triples: [ ]
            }
        );
    };//add

    this.resources.len = function() {
        return this.length;
    }
}//RDFStore()


/*
 * To empty a store, reset the list of triples and resources.
 */

RDFGraph.prototype.clear = function()
{
    this.triples.length = 0;
    this.resources.length = 0;
}


/*
 * Add a triple to the store.
 */

RDFGraph.prototype.add = function(sSubject, sPredicate, sObject, bObjectIsLiteral, oUser)
{
    var bRet = true;

    /*
     * We don't deal with resources directly, but use indexes. So the first
     * step is to work out the index, or create a new entry if one is needed.
     */

    var iURI = this.resources.find(sSubject);

    if (iURI == -1)
        iURI = this.resources.add(sSubject) - 1;

    /*
     * Next create a 'triple' using the ID of the element in the document,
     * and the three components of the triple itself.
     */

    if (!bObjectIsLiteral)
    {
      if (sPredicate == "a")
        sPredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    }

    var t = {
        subject: iURI,
        predicate: sPredicate,
        object: sObject,
        object_literal_p: bObjectIsLiteral,
        user: oUser
    };


    /*
     * Save the triple into the master list of triples...
     */

    var iTriple = this.triples.push(t) - 1;

    /*
     * ... and then create an entry in the triple list for the
     * subject resource.
     */

    this.resources[iURI].triples.push( iTriple );

    /*
     * Notify any listeners.
     */

    this.tripleAdded( t );

    return bRet;
};//RDFStore.add()

RDFGraph.prototype.tripleAdded = function(triple) {
    return;
}

RDFGraph.prototype.createBindings = function(triple, pattern)
{
  var oRet = {
    bindings:
      [
        { uri: this.resources[ triple.subject ].resource },
        { uri: triple.predicate },
        (triple.object_literal_p) ? { literal: triple.object } : { uri: triple.object },

        /*
         * If the context flag is set, then set the context to be the context of the
         * current triple.
         */

        (pattern.setUserData) ? { name: "user", uri: triple.user } : { }
      ]
  };

  /*
   * If any of the pattern components are variable names then add the
   * name to the binding information.
   */

  if (pattern.pattern[0].charAt(0) == "?")
    oRet.bindings[0].name = pattern.pattern[0].substring(1);

  if (pattern.pattern[1].charAt(0) == "?")
    oRet.bindings[1].name = pattern.pattern[1].substring(1);

  if (pattern.pattern[2].charAt(0) == "?")
    oRet.bindings[2].name = pattern.pattern[2].substring(1);

  return oRet;
}


RDFGraph.prototype.serialiseResult = function(triple, pattern)
{
  var oRet = {
    bindings:
      [
        { uri: this.resources[ triple.subject ].resource },
        { uri: triple.predicate },
        { },
        { }
      ]
  };

  if (pattern.subject.charAt(0) == "?")
    oRet.bindings[0].name = pattern.subject.substring(1);

  if (pattern.predicate.charAt(0) == "?")
    oRet.bindings[1].name = pattern.predicate.substring(1);

  if (!triple.object_literal_p)
  {
    oRet.bindings[2].uri = triple.object;
    if (pattern.objectUri.charAt(0) == "?")
      oRet.bindings[2].name = pattern.objectUri.substring(1);
  }
  else
  {
    oRet.bindings[2].literal = triple.object;
    if (pattern.objectLiteral.charAt(0) == "?")
      oRet.bindings[2].name = pattern.objectLiteral.substring(1);
  }

  /*
   * If the context flag is set, then use the context of the current triple.
   */

  if (pattern.setContext)
  {
    oRet.bindings[3].uri = triple.user;
    oRet.bindings[3].name = "context";
  }
  return oRet;
}


RDFGraph.prototype.loadFormatters = function(oParser)
{
    var bRet = true;
    var obj;
    var resources = this.resources;
    var triples = this.triples;

    for (var i = 0, len = this.resources.length; i < len; i++)
    {
        var s = resources[i];

        for (var j = 0; j < s.triples.length; j++)
        {
            var t = triples[ s.triples[j] ];

            /*
             * An included document is just dropped straight in.
             */

            if (t.predicate === "http://lib-xh.googlecode.com/include" || t.predicate === "http://www.w3.org/2002/07/owl#imports") {
              oParser.parseExternal(t.object);
            }//if ( there is an 'included' document )
        }//for (each triple)
    }//for (each subject)
    return bRet;
};//loadFormatters()


RDFGraph.prototype.createObject = function(s)
{
    var oRet = new myList();
    var triples = this.triples;

    for (var i = 0; i < s.triples.length; i++)
    {
        var t = triples[ s.triples[i] ];

        if (t.object_literal_p)
          oRet.add(t.predicate, t.object.content);
        else
          oRet.add(t.predicate, t.object);
    }//for (each triple about this resource)
    return oRet;
};//createObject()
// ** blank line in case the merged files don't have newlines...

/*
 * Ubiquity provides a standards-based suite of browser enhancements for
 * building a new generation of internet-related applications.
 * Copyright (C) 2007-8 Mark Birbeck
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Mark Birbeck can be contacted at:
 *
 *  36 Tritton Road
 *  London
 *  SE21 8DE
 *  United Kingdom
 *
 *  mark.birbeck@gmail.com
 */

/*
 * The triple store holds a list of graphs.
 */

function RDFStore() {
	this.graphs = [ ];
	this.bnode_counter = 0;
}//RDFStore()


/*
 * To empty a store, clear all of the graphs.
 */

RDFStore.prototype.clear = function() {
	var name;

	for (name in this.graphs) {
		this.graphs[ name ].clear();
	}
	return;
}//clear


RDFStore.prototype.getGraph = function( graphURI ) {
	// A null or empty graph URI means use the default graph.
	//
	graphURI = graphURI || "default";

	// If the graph we want doesn't exist, then create it.
	//
	if ( !this.graphs[ graphURI ] ) {
		this.graphs[ graphURI ] = new RDFGraph( graphURI );
	}
	return this.graphs[ graphURI ];
}//getGraph


/*
 * Add a triple to the store.
 */

RDFStore.prototype.add = function(graphURI, sSubject, sPredicate, sObject, bObjectIsLiteral, oUser) {
	// Add our triple:
	//
	var t = this.getGraph( graphURI ).add(sSubject, sPredicate, sObject, bObjectIsLiteral, oUser);

	// Notify any listeners:
	//
	this.tripleAdded( t );
	return t;
};//RDFStore.add()

RDFStore.prototype.tripleAdded = function(triple) {
    return;
}

RDFStore.prototype.insert = function(graph) {
  var graphName, i, isResource, k, triple, subgraph, subj, obj;

  //
  // Usually we have an array of graphs with no name. But there are two futher possibilities:
  //
  // - that we have a single graph, in which case we turn it into an array of one element;
  //
  // - that we have an object that contains a graph, plus some other stuff.
  //

  while (!graph.length) {
    if (graph.graph) {
      graph = graph.graph;
    }
    else
      graph = [ graph ];
  }

  for (i = 0; i < graph.length; i++) {
    subgraph = graph[i];
    graphName = subgraph.name || "";

    // If the subgraph has a 'pattern' property then use that as a complete set of triples.

    if (subgraph.pattern) {
      triple = graph[i].pattern;

      this.add(
      	graphName,
        triple[0],
        triple[1],
        triple[2],
        triple[3],
        null
      );
    }

    // Otherwise we have a RDF/JSON structure.

    else {
      // If there is no subject then create a bnode

      subj = subgraph["$"] || ("bnode:dummy" + this.bnode_counter++);
			if ((typeof(subj) === "string") && (subj.indexOf('<') === 0) && (subj.lastIndexOf('>') === subj.length - 1)) {
				subj = subj.substring(1, subj.length - 1);
			}

      // For each item in the graph we will create a triple that uses the main subject. Note that we don't want to
      // create a predicate from the subject itself.

      for (k in subgraph) {
        if (k !== "$") {
        	obj = subgraph[k];

					if (k === "a" && false) {
					}
					// If a string begins with '<' and ends with '>' then it's a full URI.
					//
					if ((typeof(obj) === "string") && (obj.indexOf('<') === 0) && (obj.lastIndexOf('>') === obj.length - 1)) {
						isResource = true;
						obj = obj.substring(1, obj.length - 1);
					} else {
	          isResource = (typeof(obj) === "object")
	          	|| (k === "http://xmlns.com/foaf/0.1/accountServiceHomepage") || (k === "http://lib-xh.googlecode.com/tooltip") || (k === "http://lib-xh.googlecode.com/icon");
	        }

          // Create a triple using:
          //
          //  - the subject set for the entire JSON object;
          //  - the property name as a predicate;
          //  - the property value as the RDF object.
          //
          // If the property value is another JSON object then we recurse, and use the subject from that
          // JSON object as the RDF object.

          this.add(
          	graphName,
            subj,
            k,
            (isResource)
              ? (
                (typeof obj == "object")
                  ? this.insert(obj, graphName)
                  : obj
              )
              : { content: obj },
            !isResource,
            null
          );
        }//if this is not the subject property
      }//for each predicate
    }//if this is a pattern...else...
  }//for each graph

  return subj;
}//insert


RDFStore.prototype.createBindings = function(graphURI, triple, pattern) {
	return this.getGraph( graphURI ).createBindings(triple, pattern);
}


RDFStore.prototype.serialiseResult = function(graphURI, triple, pattern) {
	return this.getGraph( graphURI ).serialiseResult(triple, pattern);
}


RDFStore.prototype.loadFormatters = function(graphURI, parser) {
	return this.getGraph( graphURI ).loadFormatters( parser );
};//loadFormatters()


RDFStore.prototype.createObject = function(graphURI, s) {
	return this.getGraph( graphURI ).createObject( s );
};//createObject()
// ** blank line in case the merged files don't have newlines...

// Ubiquity provides a standards-based suite of browser enhancements for
// building a new generation of internet-related applications.
//
// The Ubiquity RDFa module adds RDFa support to the Ubiquity library.
//
// Copyright (C) 2007-8 Mark Birbeck
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

// The aim of this module is to run SPARQL queries against the data store.
// The values returned are as defined in:
//
//		http://www.w3.org/TR/rdf-sparql-json-res/
//

function RDFQuery(store) {
    this.store = store;
}//RDFQuery()


// ASK simply returns a true of false indicator as to whether
// there is a result set.
//
RDFQuery.prototype.ask = function(q) {
	var r = this.query2( q );

  return {
    head: { },
    "boolean": Boolean(r.results.bindings.length)
  };
}//ask


RDFQuery.prototype.serialiseObject = function(oAction, subject, context) {
  var obj = this.store.createObject("", subject);
  var icon = null;

  if (oAction.icon)
  {
    var icon = context.document.createElement('img');

    icon.setAttribute("src", oAction.icon);
    context.appendChild(icon);
  }//if ( there is an icon for this object definition )

  if (oAction.tooltip)
  {
    new YAHOO.widget.Tooltip(
      "anon" + this.somenum++,
      {
        context: icon ? icon : context,
        text: oAction.tooltip(obj)
      }
    );
  }//if ( there is a tooltip definition )

  return;
};

RDFQuery.prototype.processObject = function(oAction, obj) {
  var context = obj.user;

  if (context)
  {
    var icon = null;

    if (oAction.icon)
    {
      icon = context.document.createElement('img');
  
      icon.setAttribute("src", oAction.icon);
      context.appendChild(icon);
    }//if ( there is an icon for this action definition )

    if (oAction.style)
    {
      //YAHOO.util.setStyle(context, "border", oAction.style.content);
      context.style["border"] = oAction.style.content;
    }//if ( there is a style for this action definition )

    if (obj.icon)
    {
      icon = context.document.createElement('img');
  
      icon.setAttribute("src", obj.icon);
      context.appendChild(icon);
    }//if ( there is an icon for this object definition )
  
    if (oAction.tooltip)
    {
      if (icon)
      {
        new YAHOO.widget.Tooltip(
          "anon" + this.somenum++,
          {
            context: icon,
            text: eval(
              "'" +
              oAction.tooltip.content.replace(/\"/g, "\'").replace(/\n/g, "").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "' + obj.$1 + '") +
              "'"
            )
            //text: oAction.tooltip(obj)
          }
        );
      }
      else
      {
        var el = context.document.createElement('span');

        el.innerHTML = eval("'" + oAction.tooltip.content.replace(/\n/g, "").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "' + obj.$1 + '") + "'");
        context.appendChild(el);
      }
    }//if ( there is a tooltip definition in the action )

    if (obj.tooltip && icon)
    {
      new YAHOO.widget.Tooltip(
        "anon" + this.somenum++,
        {
          context: icon,
          text: eval("'" + obj.tooltip.content.replace(/\n/g, "").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "' + obj.$1 + '") + "'")
          //text: eval("'" + obj.tooltip.content.replace(/\$\{(.*)\}/g, "$+"))
        }
      );
    }//if ( there is a tooltip definition from the triple store )
  }//if ( a context has been set )

  if (oAction.action)
  {
    oAction.action( obj );
  }//if ( there is an action )

  if (obj.imp)
  {
    var oParser = new RDFParser(this.store);

    oParser.parseExternal(obj.imp, oAction.onexternal);
  }//if ( there is an import instruction )

  return;
};//processObject()


/*
 * Walk the tree and do stuff.
 */

RDFQuery.prototype.walk = function(oAction) {
    var bRet = true;
    var obj;
    var resources = this.store.getGraph( "" ).resources;

    for (var i = 0, len = resources.length; i < len; i++)
    {
        var s = resources[i];

        for (var j = 0; j < s.triples.length; j++)
        {
            var t = this.store.getGraph( "" ).triples[ s.triples[j] ];

            if (oAction)
            {
              if (!oAction.predicate || (t.predicate == oAction.predicate))
              {
                if (!oAction.object || (t.object == oAction.object))
                {
                  if (oAction.pipesdata)
                  {
                    var pThis = this;
                    var rq = oAction.pipesdata(s);

                    var requestId = document.submissionJSON.run(
                      rq.url,
                      rq.params,
                      { subject: s, context: t.user },
                      function(data, userData)
                      {
                        if (oAction.adddata)
                          oAction.adddata(rq.url, data, userData.subject);

                        pThis.serialiseObject(oAction, userData.subject, userData.context);
                        return;
                      }//callback from Pipes
                    );
                  }//if ( we need to retrieve more data )
                  else
                  {
                    this.serialiseObject(oAction, s, t.user);
                  }
                }//if ( the predicate and object match )
              }
            }//if ( there is a registered action )
        }//for (each triple)
    }//for (each subject)

    return bRet;
};//walk()

RDFQuery.prototype.walk2 = function(sparql, oAction) {
    var bindings = sparql.results.bindings;

    for (var i = 0, len = bindings.length; i < len; i++)
    {
      var obj = bindings[i];

      this.processObject(oAction, obj);
    }//for (each object)

    return;
};//walk2()


RDFQuery.prototype.query = function(q) {
  var oRet =
    {
      head:
        {
          vars: [ ]
        },
      results:
        {
          ordered: false,
          distinct: false,
          bindings: [ ]
        }
    };

  var resources = this.store.getGraph( "" ).resources;
  var triples = this.store.getGraph( "" ).triples;


  /*
   * First collect a set of graphs based on the where clauses.
   */

  var graphList = [ ];
 
  for (var i = 0; i < q.where.length; i++)
  {
    var pattern = q.where[i];
    var graph =
      {
        pattern: pattern,
        triples: [ ]
      }

    for (var j = 0, len = resources.len(); j < len; j++)
    {
        var s = resources[j];

        if (pattern.subject.charAt(0) == "?" || pattern.subject.charAt(0) == "$" || (pattern.subject == s.resource))
        {
          for (var k = 0; k < s.triples.length; k++)
          {
              var t = triples[ s.triples[k] ];
  
              if (
                (pattern.predicate.charAt(0) == "?" || pattern.predicate.charAt(0) == "$" || (pattern.predicate == t.predicate))
                &&
                (!(pattern.objectUri) || pattern.objectUri.charAt(0) == "?" || pattern.objectUri.charAt(0) == "$" || ((pattern.objectUri == t.object) && !t.object_literal_p))
                &&
                (!(pattern.objectLiteral) || pattern.objectLiteral.charAt(0) == "?" || pattern.objectLiteral.charAt(0) == "$" || ((pattern.objectLiteral == t.object) && t.object_literal_p))
              )
                graph.triples.push( t );
          }//for ( each of triple tied to this resource )
        }//if ( the subjects match )
    }//for ( each resource )

    graphList.push( graph );

  }//for ( each pattern )


  /*
   * We now have a list of result-sets; we need to go through them and merge.
   */

  var y = [ ];
 
  for (i = 0; i < graphList.length; i++)
  {
    var graph = graphList[i];

    for (var j = 0; j < graph.triples.length; j++)
    {
      var o = this.store.serialiseResult(graph.graphURI, graph.triples[j], graph.pattern);

      /*
       * First we create an object.
       */

      var x = [ ];

      for (var k = 0; k < 4; k++)
      {
        /*
         * If there is a named value, then use it as a property.
         */
  
        x[k] = (o.bindings[k].name)
          ? { name: o.bindings[k].name, value: o.bindings[k].uri || o.bindings[k].literal }
          : null;
      }

      /*
       * Now we need to see if we already have a matching object.
       *
       * Note that first time through we always push onto the stack.
       */
  
      if (!i)
      {
        var z = { matches: true, failed: false, values: [ ] };

        for (k = 0; k < 4; k++)
        {
          if (x[k])
            z.values[x[k].name] = x[k].value;
        }
        y.push( z );
      }
      else
      {
        for (k = 0; k < y.length; k++)
        {
          var toMerge = y[k];
          if (toMerge.failed)
            continue;

          var merge = true;

          /*
           * If there is a full match, then we add the additional properties, if there is no match we can ignore it,
           * and if there is a partial match, we remove the stored value unless the pattern is optional.
           */

          for (m = 0; m < 4; m++)
          {
            if (x[m] && toMerge.values[x[m].name] && (x[m].value != toMerge.values[x[m].name]))
            {
              merge = false;
              break;
            }
          }
  
          if (merge)
          {
            for (m = 0; m < 4; m++)
            {
              if (x[m])
                toMerge.values[x[m].name] = x[m].value;
            }
            toMerge.matches = true;
          }
        }//for ( each item already found )
      }//if ( this is the first time through )
    }

    /*
     * Now we have to go back through the list again to see if any objects failed to get a match. If they
     * did then we remove them.
     */

    for (k = 0; k < y.length; k++)
    {
      var o = y[k];

      if (o.matches || graph.pattern.optional)
        o.matches = false;
      else
        o.failed = true;
    }
  }//for ( each graph )

  /*
   * Finally, find all the good matches.
   */

  for (i = 0; i < y.length; i++)
  {
    var o = y[i];
    var r = { };

    /*
     * If we have a good match...
     */

    if (!o.failed)
    {

      /*
       * ... copy all of requested properties.
       */

      for (var j = 0; j < q.select.length; j++)
      {
        var variable = q.select[j].substring(1);

        r[variable] = o.values[variable];
      }
      r.context = o.values["context"];
      oRet.results.bindings.push( r );
    }//if ( the item passed all of where clauses )
  }//for ( each result )
  return oRet;
}//query()

RDFQuery.prototype.query2 = function(q) {
  var oRet =
    {
      head:
        {
          vars: [ ]
        },
      results:
        {
          ordered: false,
          distinct: (typeof q.distinct === "undefined") ? true : Boolean(q.distinct),
          bindings: [ ]
        }
    };

  var graphList = [ ];
  var results = [ ];
  var bindings, vars;
  var i, j, k, duplicate;
  var uuid = 0;


  this.addGraphs(q.from ? q.from : "", q.where, results, graphList);

  if (graphList.length)
    this.mergeGraphs(results, graphList);

  /*
   * Find all of the good matches, which simply means any match that hasn't failed.
   */

  for (i = 0; i < results.length; i++)
  {
    var temp = results[i];
    var result = { };

    /*
     * If we have a good match...
     */

    if (!temp.failed)
    {

      /*
       * ... copy all of requested properties.
       *
       * [TODO] A variable of '*' means copy everything.
       */

      if (q.select && (q.select[0] != "*"))
      {
        for (var j = 0; j < q.select.length; j++)
        {
          var variable = q.select[j];
  
          oRet.head.vars[j] = variable;
          result[variable] = temp.values[variable];
        }
      }
      else
      {
        for (j = 0; j < temp.values.length; j++)
        {
          throw "Not sure about whether this correctly gets the name of property or key. (This will have been set with a 'select * where ...')";

          var variable = temp.values[j].name;
  
          oRet.head.vars[j] = variable;
          result[variable] = temp.values[variable];
        }
      }
      result["uuid"] = uuid++;
      result.user = temp.values["user"];
      oRet.results.bindings.push( result );
    }//if ( the item passed all of the where clauses )
  }//for ( each result )

	// If there are any results, and 'distinct' is set true, then reduce our list.
	//
	if (oRet.results.bindings.length && oRet.results.distinct) {
		bindings = oRet.results.bindings;
		vars = oRet.head.vars;

		for (i = 0; i < bindings.length; i++) {
			bindings[i]["uuid"] = i;
			for (j = i + 1; j < bindings.length; j++) {
				duplicate = true;
				for (k = 0; k < vars.length; k++) {
					varname = vars[k];
					if (bindings[i][varname] !== bindings[j][varname]) {
						duplicate = false;
						break;
					}
				}
				// Note that if we remove an item we need to negate the increment
				// that is about to happen on our loop.
				//
				if (duplicate) {
					bindings.splice(j--, 1);
				}
			}
		}
	}

  return oRet;
}//query2()


RDFQuery.prototype.addGraphs = function(graphURI, where, results, graphList) {

  /*
   * First collect a set of graphs based on the where clauses. A triple matches if all of its components
   * match the query triple, or the query triple has a variable in the position of a component that does
   * not match.
   */

  var resources = this.store.getGraph( graphURI ).resources;
  var triples = this.store.getGraph( graphURI ).triples;
 
  for (var i = 0; i < where.length; i++)
  {
    var pattern = where[i];

    if (pattern.where)
    {

      /*
       * First, complete the previous graph.
       */

      if (graphList.length)
        this.mergeGraphs(results, graphList);

      var subgraphList = [ ];
      var subresults = [ ];
    
      this.addGraphs(graphURI, pattern.where, subresults, subgraphList);
      if (subgraphList.length)
      {
        this.mergeGraphs(subresults, subgraphList);
        this.mergeResultSets(results, subresults, pattern.optional);
      }
    }
    else if (pattern.pattern)
    {
  
      /*
       * Map a predicate of "a" to rdf:type.
       */
  
      if (pattern.pattern[1] == "a")
        pattern.pattern[1] = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
  
      var graph =
        {
        	graphURI: graphURI,
          pattern: pattern,
          triples: [ ]
        }
  
      for (var j = 0, len = resources.length; j < len; j++)
      {
          var s = resources[j];
  
          if (pattern.pattern[0].charAt(0) == "?" || pattern.pattern[0].charAt(0) == "$" || (pattern.pattern[0] == s.resource))
          {
            for (var k = 0; k < s.triples.length; k++)
            {
                var t = triples[ s.triples[k] ];
    
                if (
                  (pattern.pattern[1].charAt(0) == "?" || pattern.pattern[1].charAt(0) == "$" || (pattern.pattern[1] == t.predicate))
                  &&
                  (pattern.pattern[2].charAt(0) == "?" || pattern.pattern[2].charAt(0) == "$" || ((pattern.pattern[2] == t.object) && !t.object_literal_p) || ((pattern.pattern[2] == t.object.content) && t.object_literal_p))
                )
                  graph.triples.push( t );
            }//for ( each triple tied to this resource )
          }//if ( the subjects match )
      }//for ( each resource )
  
      /*
       * Save the graph before moving on to the next where clause.
       */
  
      graphList.push( graph );
    }//if ( we have a basic pattern )
  }//for ( each pattern )

  return;
}//addGraphs


/*
 * Take a list of graphs and add them to a result-set.
 */

RDFQuery.prototype.mergeGraphs = function(results, graphList) {
  for (var i = 0; i < graphList.length; i++)
  {
    var graph = graphList[i];

    for (var j = 0; j < graph.triples.length; j++)
    {
      /*
       * For each triple create an object that contains the values plus any variable names.
       */

      var t = this.store.createBindings(graph.graphURI, graph.triples[j], graph.pattern);

      /*
       * Next go through each of the values, and if it has a variable name, copy it into
       * a temporary object.
       */

      var temp = [ ];

      for (var k = 0; k < 4; k++)
      {
        /*
         * If there is a named value, then use it as a property.
         */
  
        temp[k] = (t.bindings[k].name)
          ? { name: t.bindings[k].name, value: t.bindings[k].uri || t.bindings[k].literal }
          : null;
      }

      /*
       * Now we need to see if we already have an object in our results list to merge with.
       *
       * Note that first time through we always push onto the stack, since the first result
       * 'always matches'.
       */
  
      if (!i /*results.length*/)
      {
        var result = { matches: true, failed: false, values: [ ] };

        for (k = 0; k < 4; k++)
        {
          if (temp[k])
            result.values[temp[k].name] = temp[k].value;
        }
        results.push( result );
      }
      else
      {
        /*
         * If this is not the first time through, we need to see if there are any objects already
         * in the list of results that 'match' our object, and if so, merge the values.
         */

        for (k = 0; k < results.length; k++)
        {

          /*
           * Get the next object, and if it has previously been ruled out by failing a match then
           * we don't need to process it.
           */

          var toMerge = results[k];
          if (toMerge.failed) 
            continue;


          /*
           * We're now looking to take any properties that are on the object to merge, and add them to any object
           * we already have that partially matches. The only reason not to do a merge is if there is a variable
           * that occurs in both objects but the value doesn't match.
           *
           * Note that if the two objects have nothing that matches then the match flag will be set to false. This
           * means that if the current search pattern is not optional, then the existing object will be marked as
           * failing to match, and be ignored.
           */

          var merge = true;

          for (var m = 0; m < 4; m++)
          {
            if (temp[m] && toMerge.values[temp[m].name] && (temp[m].value != toMerge.values[temp[m].name]))
            {
              merge = false;
              break;
            }
          }
  
          if (merge)
          {
            for (m = 0; m < 4; m++)
            {
              if (temp[m])
                toMerge.values[temp[m].name] = temp[m].value;
            }
            toMerge.matches = true;
          }
        }//for ( each item already found )
      }//if ( this is the first time through )
    }//for ( each graph in the results set )


    /*
     * Now we have to go back through the list of candidate objects and see if any of them failed to get a match. If they
     * did then we can mark them as having failed, and they won't feature any further operations. Note that if the current
     * pattern is optional, then it always counts as a match.
     */

    for (k = 0; k < results.length; k++)
    {
      var temp = results[k];

      if (temp.matches || graph.pattern.optional)
        temp.matches = false;
      else
        temp.failed = true;
    }
  }//for ( each graph )


  /*
   * Now clear the graph-list.
   */

  graphList.length = 0;

  return;
}//mergeGraphs


/*
 * Merge two result-sets.
 */

RDFQuery.prototype.mergeResultSets = function(results, subresults, optional) {
  for (i = 0; i < subresults.length; i++)
  {
    var subresult = subresults[i];

    if (!subresult.failed)
    {

      /*
       * Now we need to see if we already have an object in our results list to merge with.
       *
       * Note that first time through we always push onto the stack, since the first result
       * 'always matches'.
       */
  
      if (!results.length)
      {
        results.push( subresult );
      }
      else
      {

        /*
         * If this is not the first time through, we need to see if there are any objects already
         * in the list of results that 'match' our object, and if so, merge the values.
         */

        for (k = 0; k < results.length; k++)
        {

          /*
           * Get the next object, and if it has previously been ruled out by failing a match then
           * we don't need to process it.
           */

          var toMerge = results[k];
          if (toMerge.failed) 
            continue;


          /*
           * We're now looking to take any properties that are on the object to merge, and add them to any object
           * we already have that partially matches. The only reason not to do a merge is if there is a variable
           * that occurs in both objects but the value doesn't match.
           *
           * Note that if the two objects have nothing that matches then the match flag will be set to false. This
           * means that if the current search pattern is not optional, then the existing object will be marked as
           * failing to match, and be ignored.
           */

          var merge = true;

          for (var m in subresult.values)
          {
            if (subresult.values[m] && toMerge.values[m] && (subresult.values[m] != toMerge.values[m]))
            {
              merge = false;
              break;
            }
          }
  
          if (merge)
          {
            for (m in subresult.values)
            {
              if (subresult.values[m])
                toMerge.values[m] = subresult.values[m];
            }
            toMerge.matches = true;
          }
        }//for ( each item already found )
      }//if ( this is the first time through )
    }//for ( each graph in the results set )


    /*
     * Now we have to go back through the list of candidate objects and see if any of them failed to get a match. If they
     * did then we can mark them as having failed, and they won't feature any further operations. Note that if the current
     * pattern is optional, then it always counts as a match.
     */

    for (k = 0; k < results.length; k++)
    {
      var temp = results[k];

      if (temp.matches || optional)
        temp.matches = false;
      else
        temp.failed = true;
    }
  }//for ( each graph )

  return results;
}//mergeResultSets

function getPropertyFromVar(obj, m, errors) {
	var sRet;
	var propArr = m.match(/\$(?:\{|%7B)(.*?)(?:\}|%7D)/);

	if ( propArr ) {
		sRet = (obj[ propArr[1] ])
			? ((obj[ propArr[1] ].content) ? obj[ propArr[1] ].content : obj[ propArr[1] ])
			: ((errors) ? "No value for '" + propArr[1] + "' (" + m + ")" : "");
	} else {
		sRet = (errors) ? "No key in '" + m + "'" : "";
	}
	return sRet;
}

function execFuncWithObj(f, context, name) {
	var expanded = f.replace(
		/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
		function (m) { return getPropertyFromVar(context.obj, m); }
	);

	try {
	  eval( expanded );
	} catch(e) {
		throw "Failed to execute '" + name + "' (" + (e.message ? e.message : e.description) + ")";
	}
	return;
}

function processFresnelSelectors(subj, obj) {
  /*
   * First find any Fresnel class styles.
   */

  //var s = (subj) ? subj : "?format";
  var s = "?format";
  var g = (subj) ? subj : "?group";
  var q;

  var classstyles = document.meta.query2({
    select: [ "t", "cl", "action", "yowl", "icon", "tooltip", "pipesdata", "adddata", "afterpipesdata" ],
    where:
      [
        { pattern: [ s,         "a",                                                   "http://www.w3.org/2004/09/fresnel#Format" ] },
        { pattern: [ s,         "http://www.w3.org/2004/09/fresnel#group",             g ] },
        { pattern: [ g,         "a",                                                   "http://www.w3.org/2004/09/fresnel#Group" ] },
        { pattern: [ s,         "http://www.w3.org/2004/09/fresnel#classFormatDomain", "?t" ] },
        { pattern: [ s,         "http://www.w3.org/2004/09/fresnel#resourceStyle",     "?cl" ],      optional: true },
        { pattern: [ s,         "http://lib-xh.googlecode.com/action",                 "?action" ],  optional: true },
        { pattern: [ s,         "http://lib-xh.googlecode.com/yowl",                   "?yowl" ],    optional: true },
        {
          where:
            [
              { pattern: [ s,     "http://lib-xh.googlecode.com/tooltip",          "?tt" ] },
              { pattern: [ "?tt",     "http://lib-xh.googlecode.com/icon",             "?icon" ], optional: true },
              { pattern: [ "?tt",     "http://lib-xh.googlecode.com/template",         "?tooltip" ] }
            ],
          optional: true
        },
        {
          where:
            [
              { pattern: [ s, "http://lib-xh.googlecode.com/pipesdata",        "?pipesdata" ] },
              { pattern: [ s, "http://lib-xh.googlecode.com/adddata",          "?adddata" ] },
              { pattern: [ s, "http://lib-xh.googlecode.com/afterpipesdata",   "?afterpipesdata" ], optional: true }
            ],
          optional: true
        }
      ]
  });

  /*
   * Now find all elements that have the types indicated, and set the corresponding CSS class.
   */

  document.meta.walk2(
    classstyles,
    {
      action: function(classobj)
      {
        var instances = document.meta.query2(
          {
            select: [ "s" ],
            where:
              [
                { pattern: [ "?s", "a", classobj.t ], setUserData: true }
              ]
          }
        );

        document.meta.walk2(
          instances,
          {
            action: function(instobj)
              {
                processFresnelFormats(instobj.user, classobj);
                processLibXhFormats(instobj, classobj);
              }
          }
        );
      }
    }
  );

  /*
   * Now do the same for properties.
   */

  classstyles = document.meta.query2({
    select: [ "p", "cl" ],
    where:
      [
        { pattern: [ s, "a",                                                      "http://www.w3.org/2004/09/fresnel#Format" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#propertyFormatDomain", "?p" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#resourceStyle",        "?cl" ] }
      ]
  });

  /*
   * Now find all elements that have the predicates indicated, and set the corresponding CSS class.
   */

  document.meta.walk2(
    classstyles,
    {
      action: function(classobj)
      {
        var results = document.meta.query2(
          {
            select: [ "o" ],
            where:
              [
                { pattern: [ "?s", classobj.p, "?o" ], setUserData: true }
              ]
          }
        );

        document.meta.walk2(
          results,
          {
            action: function(instobj)
            {
              processFresnelFormats(instobj.user, classobj);
            }
          }
        );
      }
    }
  );


  /*
   * Now do the same for any SPARQL queries.
   */

  classstyles = document.meta.query2({
    select: [ "q", "cl", "action", "yowl", "embedInit", "embedTemplate", "embedTitle", "icon", "tooltip", "pipesdata", "adddata", "afterpipesdata" ],
    where:
      [
        { pattern: [ s, "a",                                                      "http://www.w3.org/2004/09/fresnel#Format" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#group",                g ] },
        { pattern: [ g, "a",                                                      "http://www.w3.org/2004/09/fresnel#Group" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#instanceFormatDomain", "?q" ] },
        { pattern: [ s, "http://www.w3.org/2004/09/fresnel#resourceStyle",        "?cl" ],      optional: true },
        { pattern: [ s, "http://lib-xh.googlecode.com/action",                    "?action" ],  optional: true },
        { pattern: [ s, "http://lib-xh.googlecode.com/yowl",                      "?yowl" ],    optional: true },
        {
          where:
            [
              { pattern: [ s, "http://lib-xh.googlecode.com/tooltip",             "?tt" ] },
              { pattern: [ "?tt",     "http://lib-xh.googlecode.com/icon",                "?icon" ], optional: true },
              { pattern: [ "?tt",     "http://lib-xh.googlecode.com/template",            "?tooltip" ] }
            ],
          optional: true
        },
        {
          where:
            [
              { pattern: [ s,        "http://lib-xh.googlecode.com/embed",    "?embed" ] },
              { pattern: [ "?embed", "http://lib-xh.googlecode.com/template", "?embedTemplate" ] },
              { pattern: [ "?embed", "http://lib-xh.googlecode.com/init",     "?embedInit" ], optional: true }
            ],
          optional: true
        },
        {
          where:
            [
              { pattern: [ s, "http://lib-xh.googlecode.com/pipesdata",           "?pipesdata" ] },
              { pattern: [ s, "http://lib-xh.googlecode.com/adddata",             "?adddata" ] },
              { pattern: [ s, "http://lib-xh.googlecode.com/afterpipesdata",      "?afterpipesdata" ], optional: true }
            ],
          optional: true
        }
      ]
  });

  /*
   * Now run each of the queries returned.
   */

  document.meta.walk2(
    classstyles,
    {
      action: function(classobj)
      {
				try {
					q = classobj.q.content.replace(
						/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
						function (m) { return getPropertyFromVar(obj, m); }
					);
				} catch(e) {
				}

        var r = document.meta.query2( eval( "({" + q + "})" ) );

        document.meta.walk2(
          r,
          {
            action: function(instobj)
            {
              processFresnelFormats(instobj.user, classobj);
              processLibXhFormats(instobj, classobj);
            }
          }
        );
      }
    }
  );
  return;
}//processFresnelSelectors

function processFresnelFormats(user, format) {
  if (format.cl)
  {
    YAHOO.util.Dom.addClass(user, format.cl.content);
  }
  return;
}//processFresnelFormats

function processLibXhFormats(obj, format) {
  var context = obj.user;

  /*
   * Prioritise getting external data, just in case we need it.
   */

  if (format.pipesdata)
  {
    var pThis = this;
    eval(
      "var rq = {" +
        format.pipesdata.content.replace(/[\n\r]/g, "").replace(/\"/g, "'").replace(/\$[\{\%7B]([^\}\%7D]*)[\}\%7D]/g, "obj.$1") +
        "};"
    );

    var requestId = document.submissionJSON.run(
      rq.url,
      rq.params,
      obj,
      function(data, userData)
      {
        if (format.adddata) {
        	execFuncWithObj(format.adddata.content, { data: data, obj: userData}, "adddata");

					//eval(
          //  format.adddata.content.replace(/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g, "obj.$1")
          //);
        }
        if (format.afterpipesdata) {
          processFresnelSelectors(format.afterpipesdata, userData);
        }
        return;
      }//callback from Pipes
    );
  }//if ( we need to retrieve more data )


  if (context)
  {
    var icon = null;

    if (format.icon)
    {
      icon = context.ownerDocument.createElement('img');
  
      icon.setAttribute("src", format.icon);
      context.appendChild(icon);
    }//if ( there is an icon for this action definition )

    if (format.tooltip) {
      var t;
      try {
        eval(
        	"t = '" +
        	format.tooltip.content.replace(/\n/g, "").replace(/\'/g, "\\\'").replace(
        		/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
        		"' + obj.$1 + '"
        	) +
        	"';"
       	);
      } catch(e) {
        t = "error: " + e.description;
      }
      if (icon) {
        new YAHOO.widget.Tooltip(
          "anon" + this.somenum++,
          {
            context: icon,
            text: t
            //text: oAction.tooltip(obj)
          }
        );
      } else {
        var el = context.ownerDocument.createElement('span');
  
        el.innerHTML = t;
        context.appendChild(el);
      }
    }//if ( there is a tooltip definition in the format )

    if (format.embedTemplate) {
			var t;
			var el = context.ownerDocument.createElement('span');

			try {
				t = format.embedTemplate.content.replace(
					/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
					function (m) { return getPropertyFromVar(obj, m, true); }
				);
			} catch(e) {
			  t = "error: " + e.description;
			}
			el.innerHTML = t;

      // The new node is a sibling of the node that generated the mark-up, not a child.
      //
      context.parentNode.insertBefore(el, context.nextSibling);

      if (format.embedInit) {
				t = format.embedInit.content.replace(
					/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g,
					function (m) { return getPropertyFromVar(obj, m); }
				);
        eval( t );
      }
    }//if ( there is a template to embed )
  }//if ( there is a context )

  if (format.action) {
  	if (typeof(format.action.content) === "string") {
	    eval(
	      format.action.content.replace(/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g, "obj.$1")
	    );
	  } else if (typeof(format.action.content) === "function") {
			format.action.content.call(null, obj);
	  }
  }

  if (format.yowl) {
    eval(
      format.yowl.content.replace(/\$(?:\{|\%7B)(.*?)(?:\}|\%7D)/g, "obj.$1")
    );
  }
  return;
}//processLibXhFormats

// ** blank line in case the merged files don't have newlines...

/* Define linked data support */

YAHOO.namespace("cc.ld");

YAHOO.cc.ld.define_modules = function (loader) {
    // define additional modules on an instance of YUI Loader 

    var UBIQUITY_RDFA_BASE = "http://ubiquity-rdfa.googlecode.com/svn/tags/0.7.2/lib/";

    loader.addModule({ name: "ubiquity-backplane",      
		type: "js",  
		fullpath: "http://ubiquity-backplane.googlecode.com/svn/tags/0.4.5/backplane-loader.js" });
    loader.addModule({ name: "ubiquity-threads",        
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "_backplane/threads.js" });
    loader.addModule({ name: "ubiquity-notify",         
		type: "js",  
		fullpath: "http://ubiquity-message.googlecode.com/svn/tags/0.5/lib/message-loader.js" });

    loader.addModule({ name: "ubiquity-rdfparser",      
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFParser.js",
		requires: [ "ubiquity-backplane" ] });
                
    loader.addModule({ name: "ubiquity-rdfgraph",       
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFGraph.js" });
                
    loader.addModule({ name: "ubiquity-rdfstore",       
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFStore.js",
		requires: [ "ubiquity-rdfgraph" ] });
                
    loader.addModule({ name: "ubiquity-rdfquery",       
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFQuery.js",
		requires: [ "dom", "container", "ubiquity-rdfstore" ] });
                
} // load_modules

    YAHOO.cc.ld.request_success = function (response) {


	if (response.status != 200) return;

	var metadata = YAHOO.lang.JSON.parse(response.responseText);

	// create the store and add the RDF assertions
	store = new RDFStore();


	for (var s_idx in metadata.subjects) {
	    s = metadata.subjects[s_idx];
	    for (var p in metadata.triples[s]) {
		for (var o_idx in metadata.triples[s][p]) {
		    o = metadata.triples[s][p][o_idx];
		    store.add(null, s, p, o, false, null);
		}
	    }
	}

	response.argument.success(store);

    } // cc.ld.request_success

YAHOO.cc.ld.request_failure = function (o) {

    o.argument.failure(o.status);

} // failure


    YAHOO.cc.ld.load = function (url, proxy_path, parse_callback) {
	// pass the URL to the linked_data proxy and return 
	// an RDF Store with the triples we find loaded in it

	// construct the request callback
	var callback = {
	    success: YAHOO.cc.ld.request_success,
	    failure: YAHOO.cc.ld.request_failure,
	    argument: parse_callback
	};

	// initialize the header to include the Referer
	YAHOO.util.Connect.initHeader('Referer', document.URL, true);

	var url = proxy_path + '?url=' + encodeURIComponent(url);
	YAHOO.util.Connect.asyncRequest('GET', url, callback, null);

    } // load

YAHOO.cc.ld.finish_init = function() {

    // we've loaded our dependencies, register the module
    YAHOO.register("cc.ld", YAHOO.cc.ld, {version:'0.1', build:'001'});
}

YAHOO.cc.ld.finish_init();


