class Api::V1::UniqueController < ApplicationController
	respond_to :json
	skip_before_action :verify_authenticity_token 


  #POST formulas/:formula_id/variables
  def unique?
    info = params[:data]

    result = {}

    puts info
    
    #static table describe different models and
    #its associated models
    #used for updating ids
    torders = [{name:"properties", idColumn: :property_id, classA:Property, references:[]},
      {name:"units",  idColumn: :unit_id, classA:Unit,  references:[:property_id]},
      {name:"globals",  idColumn: :global_id, classA:Global,  references:[:unit_id]},
      {name:"formulas",  idColumn: :formula_id, classA:Formula,  references:[:unit_id, :property_id]},
      {name:"fgs",  idColumn: :fg_id, classA:Fg,  references:[:formula_id, :global_id]},
      {name:"variables",  idColumn: :variable_id, classA:Variable,  references:[:unit_id, :property_id, :formula_id]}
    ]

    tinfo = torders.find {|i| i[:name] == info[:table]};
    if current_user
      puts current_user
      user_id = current_user.id
    else
      puts "user not logged in"
      user_id = nil
    end 

    if tinfo[:classA].unique? info[:field], info[:value], info[:id], user_id
      result[:id] = info[:id]
    else
      result[:id] = "unique-id";
    end

    render json: {data: result}
  end #def

end