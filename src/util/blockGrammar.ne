@builtin "number.ne"
@builtin "whitespace.ne"

main -> expression {% id %}

expression -> 
   "**" 

plain -> .:*