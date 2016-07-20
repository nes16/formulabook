class Testlab::StaticPagesController < ApplicationController
 
  def testlab
     render layout: "testlab"
  end
end