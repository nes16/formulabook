require "./db/seed_lib.rb";

Formula.delete_all
Variable.delete_all
Global.delete_all
Favorite.delete_all
Category.delete_all

cs = Category.create name: 'Science' 
cs.children.create name: 'Physics'
cs.children.create name: 'Chemistry'
cm = Category.create name: 'Mathemetics' 
cgeo = cm.children.create name: 'Geometry'
ce = Category.create name: 'Engineering' 
ce.children.create name:'Civil'
ce.children.create name:'Mechanical'
ce.children.create name:'Electrical'

f = Formula.create name: 'Volume of tank', symbol: 'vol', property_id: Property.find_by(name: 'Volume').id, latex: 'l\\cdot w\\cdot h'
prop_id = Property.find_by(name: 'Length').id;
f.variables << Variable.create( name: 'Length',  symbol: 'l', property_id: prop_id)
f.variables << Variable.create( name: 'Width',   symbol: 'w', property_id: prop_id)
f.variables << Variable.create( name: 'Height',  symbol: 'h', property_id: prop_id)

f = Formula.create name: 'Force', symbol: 'f', property_id: Property.find_by(name: 'Force').id, latex: 'm\\cdot g'
f.variables << Variable.create( name: 'Mass',  symbol: 'm', property_id: Property.find_by(name: 'Mass').id)

g1 = Global.create name: 'Acceleration due to gravity',   symbol: 'g', unit_id: Unit.find_by(symbol: 'm/s2').id, value: '9.8'

f.globals << g1

aus = Unit.all.select(:id);
aps = Property.all.select(:id)

50.times do |n|
	name = "Formula#{n}"
	gname  = "Constant#{n}"
	g = Global.create( name: gname, symbol: "g#{n}", unit_id: Unit.find(aus[rand(1..100)]).id, value: rand(1..100))

	v1 = "v_#{n+1}"
	v2 = "v_#{n+2}"
	v3 = "v_#{n+3}"
	un = rand(1..5)
	f = Formula.create user_id: User.find_by(email: "testuser#{un}@sangamsoftech.com").id,  name: "Formula#{n}", symbol: "f_#{n}", property_id: Property.find(aps[rand(1..30)].id).id, latex: "v1\\cdot v2\\cdot v3\\cdot g#{n}"
	f.addVariable v1 + ' Variable',  v1, Property.find(aps[rand(1..30)].id).id
	f.addVariable v2 + ' Variable',  v2, Property.find(aps[rand(1..30)].id).id
	f.addVariable v3 + ' Variable',  v3, Property.find(aps[rand(1..30)].id).id
	f.addglobals([g]);
end

users = User.all
users.each do |user|
	5.times do |n|
		r = rand(1..49);
		r1 = rand(1..49)
		f = Formula.find_by(name: "Formula#{r}").id;
		p = Property.find(aps[rand(1..30)].id).id
		u = Unit.find(aus[rand(1..100)].id).id
		g = Global.find_by(name: "Constant#{r1}").id
		user.favorites <<  f
		user.favorites << p
		user.favorites << u
		user.favorites << g
		user.save
	end
end

