YAHOO.cc.deed.DEED_INFO =  {
    select: [ "work", "morePermissions", "attributionName", "attributionURL", "title" ],
    where:
    [
	{ pattern: [ "?work", 
		     "http://www.w3.org/1999/xhtml/vocab#license",
		     document.URL ] },

	// optional: Attribution and Work Metadata
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://creativecommons.org/ns#attributionName", 
			   "?attributionName" ] }
	  ],
	  optional: true
	},
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://creativecommons.org/ns#attributionURL", 
			   "?attributionURL" ] }
	  ],
	  optional: true
	},
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://purl.org/dc/elements/1.1/title", 
			   "?title" ] }
	  ],
	  optional: true
	},
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://purl.org/dc/terms/title", 
			   "?title" ] }
	  ],
	  optional: true
	},

	// optional: CC+
	{ where:
	  [
	      { pattern: [ "?work",
			   "http://creativecommons.org/ns#morePermissions", 
			   "?morePermissions" ] }
	  ],
	  optional: true
	}

	// optional: Registration

	// optionally look for disease information
	]
};

